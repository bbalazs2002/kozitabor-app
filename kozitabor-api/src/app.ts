import path from "path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.middleware.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import coreRoutes from "./routes/core.js";
import { morganStream } from "./utils/logger.js";

const isDev = process.env.IS_DEV === "true";
const origin = isDev ? true : `${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}`;

const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: origin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(morgan("combined", { stream: morganStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api", apiLimiter);
app.use("/api", coreRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use(errorHandler);

export default app;
