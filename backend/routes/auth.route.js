import express from "express";
import {
  login,
  logout,
  refreshToken,
  singup,
} from "../controllers/auth.contoller.js";

const router = express.Router();

router.post("/singup", singup);

router.post("/login", login);

router.post("/logout", logout);

router.get("/refresh-token", refreshToken);

export default router;
