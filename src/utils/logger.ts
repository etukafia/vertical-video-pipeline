import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Derive log level from environment
const profile = process.env.RENDER_PROFILE || "fast";
const level = profile === "production" ? "info" : "debug";

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `[${timestamp}] ${level}: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ""
    }`;
  })
);

export const logger = winston.createLogger({
  level,
  format: logFormat,
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, `run-${new Date().toISOString().replace(/[:.]/g, "-")}.log`),
      level,
    }),
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});
