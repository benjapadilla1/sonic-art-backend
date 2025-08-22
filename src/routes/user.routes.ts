import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  getUserFromToken,
} from "../controllers/user.controller";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

router.get("/", getAllUsers);
router.get("/me", requireAdmin, getUserFromToken);
router.get("/:uid", getUserById);

export default router;
