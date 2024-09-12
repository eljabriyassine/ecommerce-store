import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
