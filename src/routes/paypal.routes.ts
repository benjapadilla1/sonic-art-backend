import { Router } from "express";
import {
  cancelOrder,
  captureOrder,
  createOrder,
} from "../controllers/paypal.controller";
import { areItemsAlreadyBought } from "../middlewares/areItemsAlreadyBought";

const router = Router();

router.post("/create-order", areItemsAlreadyBought, createOrder);
router.post("/capture-order", captureOrder);
router.delete("/cancel-order", cancelOrder);

export default router;
