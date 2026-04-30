import 'dotenv/config';
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import coreRoutes from './routes/core.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import { prisma } from './lib/prisma';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/error.middleware.js';
import { logger, morganStream, LOG_PATHS } from './utils/logger.js';

// .env check
if (!process.env.CLIENT_URL || !process.env.CLIENT_PORT) {
  logger.warn("Hiányzó konfiguráció: CLIENT_URL és CLIENT_PORT nincs beállítva.");
}
if (!process.env.API_PORT) {
  logger.warn("Hiányzó konfiguráció: API_PORT nincs beállítva.");
}

// Create app
const isDev = process.env.IS_DEV === 'true';
const origin = isDev ? true : `${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}`;
const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(morgan('combined', { stream: morganStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve('uploads')));

// Configure routes
app.use('/api', apiLimiter);
app.use('/api', coreRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use(errorHandler);

// Run server and open port 5000
const PORT = process.env.API_PORT;
const server = app.listen(PORT, () => {
  console.log(`API szerver elindult. Naplófájlok: ${LOG_PATHS.combined} | ${LOG_PATHS.error}`);
});

// On server shutdown
const shutdown = async (signal: string) => {
  logger.info(`${signal} érkezett. A szerver leállítása folyamatban...`);

  server.close(async () => {
    logger.info("HTTP szerver lezárva.");

    try {
      await prisma.$disconnect();
      logger.info("Adatbázis kapcsolat sikeresen lezárva.");
      process.exit(0);
    } catch (err) {
      logger.error("Hiba a leállás során:", { error: err });
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error("A leállás túl sokáig tart, kényszerített kilépés...");
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
