import express from "express";
import { login, logout, singup } from "../controllers/auth.contoller.js";

const router = express.Router();

router.get("/singup", singup);

router.get("/login", login);

router.get("/logout", logout);

export default router;
