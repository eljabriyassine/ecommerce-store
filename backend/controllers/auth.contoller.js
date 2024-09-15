import jwt from "jsonwebtoken";
import redis from "../lib/redis.js";
import User from "../models/user.model.js";

const generateToken = (userId) => {
  const accesToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15min",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accesToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refreshToken:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );
};

const setCookies = (res, accesToken, refreshToken) => {
  res.cookie("accesToken", accesToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const singup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userIsExist = await User.findOne({ email });
    if (userIsExist) {
      return res.status(400).send({ message: "User already exists" });
    }
    const user = await User.create({ name, email, password });

    // authenticate
    const { accesToken, refreshToken } = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accesToken, refreshToken);

    res.status(201).send({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "user created succefully",
    });
  } catch (err) {
    res.status(500).send({ error: "Error encountered: " + err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.send({ message: "user not found" });
    }

    const isMatch = await user.matchPassword(password);

    if (isMatch) {
      // authenticate
      const { accesToken, refreshToken } = generateToken(user._id);
      await storeRefreshToken(user._id, refreshToken);

      setCookies(res, accesToken, refreshToken);

      return res.send({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        message: "login succefully",
      });
    } else {
      res.send({ message: "password is incorrect" });
    }
  } catch (err) {
    res.status(500).send({ error: "error server " + err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refreshToken:${decoded.userId}`);
      res.clearCookie("accesToken");
      res.clearCookie("refreshToken");
      res.send({ message: "logged out Succefully" });
    }
  } catch (err) {
    res.status(500).send({ message: "internal server occured" + err.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).send({ message: "no acces Token provided" });
    }
    const { userId } = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const storedToken = await redis.get(`refreshToken:${userId}`);

    if (storedToken !== refreshToken) {
      return res.status(401).send({ message: "Invalid refresh Token " });
    }

    const accesToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });
    res.cookie("accesToken", accesToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.json({ message: "token refreshed succefully" });
  } catch (err) {
    res.status(500).send({ message: "refresh token error:" + err.message });
  }
};
