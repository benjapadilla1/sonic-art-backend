import { Router } from "express";
import {
  captureOrder,
  createOrder,
  paypalWebhook,
} from "../controllers/paypal.controller";

const router = Router();

router.post("/create-order", createOrder);
router.get("/capture-order", captureOrder);
router.get("/cancel-order", captureOrder);
router.post("/webhook", paypalWebhook);

export default router;
