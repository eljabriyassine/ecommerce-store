import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectedRoute = async (req, res, next) => {
  try {
    const accesToken = req.cookies.accesToken;
    if (!accesToken) {
      return res.status(401).send({ message: "No access token provided" });
    }
    const { userId } = jwt.verify(accesToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(500).send("Internal server error: " + error.message);
  }
};

export const adminOnly = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      return next();
    }
    return res.status(403).send({ message: "Not authorized: admin only" });
  } catch (error) {
    res.status(500).send("Internal server error: " + error.message);
  }
};
