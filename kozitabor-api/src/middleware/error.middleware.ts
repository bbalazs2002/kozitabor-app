import { Prisma } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Az adat már létezik.' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Nem található.' });
      return;
    }
    res.status(400).json({ error: 'Adatbázis hiba.', code: err.code });
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ error: 'Érvénytelen adatok a kérésben.' });
    return;
  }

  logger.error('Unhandled error', { error: err });
  res.status(500).json({ error: 'Belső szerver hiba.' });
};
