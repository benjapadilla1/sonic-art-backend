import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  getUserFromToken,
  grantCoursesToUser,
  updateUserProfile,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.get("/", getAllUsers);
router.get("/me", verifyToken, getUserFromToken);
router.get("/:uid", getUserById);
router.put("/:uid", updateUserProfile);
router.post("/:uid/grant-courses", grantCoursesToUser);

export default router;
