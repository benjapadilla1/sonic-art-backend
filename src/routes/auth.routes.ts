import { Router } from "express";
import {
  forgotPassword,
  login,
  register,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/login", login);

export default router;
