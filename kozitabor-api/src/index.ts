import 'dotenv/config';
import app from './app.js';
import { prisma } from './lib/prisma.js';
import { logger, LOG_PATHS } from './utils/logger.js';

if (!process.env.CLIENT_URL || !process.env.CLIENT_PORT) {
  logger.warn('Hiányzó konfiguráció: CLIENT_URL és CLIENT_PORT nincs beállítva.');
}
if (!process.env.API_PORT) {
  logger.warn('Hiányzó konfiguráció: API_PORT nincs beállítva.');
}

const PORT = process.env.API_PORT;
const server = app.listen(PORT, () => {
  console.log(`API szerver elindult. Naplófájlok: ${LOG_PATHS.combined} | ${LOG_PATHS.error}`);
});

const shutdown = async (signal: string) => {
  logger.info(`${signal} érkezett. A szerver leállítása folyamatban...`);

  server.close(async () => {
    logger.info('HTTP szerver lezárva.');
    try {
      await prisma.$disconnect();
      logger.info('Adatbázis kapcsolat sikeresen lezárva.');
      process.exit(0);
    } catch (err) {
      logger.error('Hiba a leállás során:', { error: err });
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('A leállás túl sokáig tart, kényszerített kilépés...');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
