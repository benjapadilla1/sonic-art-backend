import { Router } from "express";
import {
  createSamplePack,
  deleteSamplePack,
  getAllSamplePacks,
  getPurchasedSamplePacks,
  getSamplePackById,
  updateSamplePack,
} from "../controllers/samplepack.controller";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/", getAllSamplePacks);
router.get("/:id", getSamplePackById);
router.get("/purchased/:id", getPurchasedSamplePacks);
router.post("/", upload.any(), createSamplePack);
router.put("/:id", upload.any(), updateSamplePack);
router.delete("/:id", deleteSamplePack);

export default router;
