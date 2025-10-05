import { Router } from "express";
import {
  sendContactEmail,
  sendOrderNotificationController,
} from "../controllers/contact.controller";

const router = Router();

router.post("/", sendContactEmail);
router.post("/order-notification", sendOrderNotificationController);

export default router;
