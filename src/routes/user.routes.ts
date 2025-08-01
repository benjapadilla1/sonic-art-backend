import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  isUserAdmin,
} from "../controllers/user.controller";
import { requireAdmin } from "../middlewares/requireAdmin";

const router = Router();

router.get("/", getAllUsers);
router.get("/:uid", getUserById);
router.get("/is-admin", requireAdmin, isUserAdmin);

export default router;
