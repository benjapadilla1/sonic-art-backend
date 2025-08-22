import { Router } from "express";
import {
  forgotPassword,
  login,
  register,
  signInWithGoogle,
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.post("/login", login);
router.post("/google", signInWithGoogle);

export default router;
