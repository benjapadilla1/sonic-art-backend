import cors from "cors";
import express from "express";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler";
import routes from "./routes";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://sonicartlab.com", // tu frontend deployado
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

app.use("/", routes);
app.use(errorHandler);

export default app;
