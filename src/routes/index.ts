import { Router } from "express";
import authRoutes from "./auth.routes";
import contactRoutes from "./contact.routes";
import coursesRoutes from "./courses.routes";
import paypalRoutes from "./paypal.routes";
import samplePackRoutes from "./samplepack.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/contact", contactRoutes);
router.use("/courses", coursesRoutes);
router.use("/samplepacks", samplePackRoutes);
router.use("/paypal", paypalRoutes);

export default router;
