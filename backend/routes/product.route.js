import express from "express";
import {
  getAllProducts,
  getFeaturedProduct,
  createProduct,
  deleteProduct,
  getProductsByCategory,
  getRecommendedProducts,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import { protectedRoute, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, adminOnly, getAllProducts);
router.get("/featured", getFeaturedProduct);
router.get("category/:category", getProductsByCategory);
router.post("/createProduct", protectedRoute, adminOnly, createProduct);
router.delete("/deleteProduct/:id", protectedRoute, adminOnly, deleteProduct);
router.get("/redommendedProducts", protectedRoute, getRecommendedProducts);
router.get("/featured/:id", protectedRoute, adminOnly, toggleFeaturedProduct);

export default router;
