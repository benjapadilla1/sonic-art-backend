import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  getPurchasedCourseById,
  getPurchasedCourses,
  updateCourse,
} from "../controllers/courses.controller";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.get("/purchased/:id", getPurchasedCourses);
router.get("/purchased/:userId/:id", getPurchasedCourseById);
router.post("/", upload.any(), createCourse);
router.put("/:id", upload.any(), updateCourse);
router.delete("/:id", deleteCourse);

export default router;
