import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from "../controllers/courses.controller";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/", getAllCourses);
router.get("/:id", getCourseById);
router.post("/", upload.any(), createCourse);
router.put("/:id", upload.any(), updateCourse);
router.delete("/:id", deleteCourse);

export default router;
