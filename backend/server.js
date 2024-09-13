import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import connectToMongoDB from "./lib/db.js";

dotenv.config();

connectToMongoDB();

const PORT = process.env.PORT || 5000;

const app = express();

// parse the body of the request to json
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  const accesToken = "ifhefheifheifhiehfei";
  res.cookie("accesToken", accesToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.send({ accesToken: accesToken });
});

app.get("/remove", (req, res) => {
  console.log(req);
  res.send({ message: req.cookies.accesToken });
});
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
