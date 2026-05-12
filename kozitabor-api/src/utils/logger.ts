import fs from "fs";
import path from "path";
import winston from "winston";

const LOG_DIR = path.resolve("logs");
fs.mkdirSync(LOG_DIR, { recursive: true });

export const LOG_PATHS = {
  combined: path.join(LOG_DIR, "combined.log"),
  error: path.join(LOG_DIR, "error.log"),
};

export const logger = winston.createLogger({
  level: "http",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: LOG_PATHS.error, level: "error" }),
    new winston.transports.File({ filename: LOG_PATHS.combined }),
  ],
});

export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};
