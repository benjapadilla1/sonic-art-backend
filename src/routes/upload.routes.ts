import { Router } from "express";
import { uploadVideo } from "../controllers/upload.controller";
import { upload } from "../middlewares/upload";

const router = Router();

router.post("/", upload.single("video"), uploadVideo);

export default router;
