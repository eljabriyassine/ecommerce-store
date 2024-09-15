import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";

import connectToMongoDB from "./lib/db.js";

dotenv.config();

connectToMongoDB();

const PORT = process.env.PORT || 5000;

const app = express();

// parse the body of the request to json
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
