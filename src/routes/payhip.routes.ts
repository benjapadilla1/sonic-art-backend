import { Router } from "express";
import { getAllProducts, getCourses } from "../controllers/payhip.controller";

const router = Router();

router.get("/courses", getCourses);

router.get("/products", getAllProducts);

export default router;
