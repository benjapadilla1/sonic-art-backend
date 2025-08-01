import { Router } from "express";
import {
  createSamplePack,
  deleteSamplePack,
  getAllSamplePacks,
  getSamplePackById,
  updateSamplePack,
} from "../controllers/samplepack.controller";

const router = Router();

router.get("/", getAllSamplePacks);
router.get("/:id", getSamplePackById);
router.post("/", createSamplePack);
router.put("/:id", updateSamplePack);
router.delete("/:id", deleteSamplePack);

export default router;
