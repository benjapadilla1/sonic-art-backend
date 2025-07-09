import express from "express";
import payhipRoutes from "./routes/payhip.routes";

const app = express();

app.use(express.json());
app.use("/payhip", payhipRoutes);

export default app;
