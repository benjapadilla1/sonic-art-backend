import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  getUserFromToken,
  updateUserProfile,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.get("/", getAllUsers);
router.get("/me", verifyToken, getUserFromToken);
router.get("/:uid", getUserById);
router.put("/:uid", updateUserProfile);

export default router;
