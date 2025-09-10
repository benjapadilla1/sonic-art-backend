import { Router } from "express";
import {
  cancelOrder,
  captureOrder,
  createOrder,
  paypalWebhook,
} from "../controllers/paypal.controller";

const router = Router();

router.post("/create-order", createOrder);
router.post("/capture-order", captureOrder);
router.delete("/cancel-order", cancelOrder);
router.post("/webhook", paypalWebhook);

export default router;
