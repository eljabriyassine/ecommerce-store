import User from "../models/user.model.js";

export const singup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userIsExist = await User.findOne({ email });
    if (userIsExist) {
      return res.status(400).send({ message: "User already exists" }); // Ensure to use return here
    }
    const user = await User.create({ name, email, password });

    res.status(201).send({ user: user });
  } catch (err) {
    res.status(500).send({ error: "Error encountered: " + err.message }); // Ensure to use send, not message
  }
};

export const login = async (req, res) => {
  res.send("login called");
};

export const logout = async (req, res) => {
  res.send("logout called");
};
