import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes";
import payhipRoutes from "./routes/payhip.routes";

const app = express();

app.use(cors());

app.use(express.json());
app.use("/payhip", payhipRoutes);
app.use("/auth", authRoutes);

export default app;
