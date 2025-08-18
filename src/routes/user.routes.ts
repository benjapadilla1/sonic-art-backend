import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  isUserAdmin,
} from "../controllers/user.controller";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

router.get("/", getAllUsers);
router.get("/me", requireAdmin, isUserAdmin);
router.get("/:uid", getUserById);

export default router;
