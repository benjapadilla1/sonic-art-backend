import cors from "cors";
import express from "express";
import morgan from "morgan";
import { errorHandler } from "./middlewares/errorHandler";
import routes from "./routes";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://sonicartlab.com",
  "https://www.sonicartlab.com",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(cors());

app.use(express.json());
app.use(morgan("dev"));

app.use("/", routes);
app.use(errorHandler);

export default app;
