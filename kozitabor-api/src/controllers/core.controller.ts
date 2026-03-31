import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getLivePrograms = async (_req: Request, res: Response) => {
  const now = new Date();
  const nowTs = now.getTime();

  // Lekérünk egy tágabb intervallumot (tegnapelőttől holnapig)
  const potentialPrograms = await prisma.program.findMany({
    where: {
      startDay: {
        gte: new Date(nowTs - 2 * 24 * 60 * 60 * 1000),
        lte: new Date(nowTs + 24 * 60 * 60 * 1000)
      }
    }
  });

  const getTs = (p: any, type: 'start' | 'end') => {
    const d = new Date(p.startDay);
    const midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    if (type === 'start') return midnight + (p.startTimeOffset * 1000);
    
    const isNextDay = p.endTimeOffset < p.startTimeOffset;
    return midnight + (p.endTimeOffset * 1000) + (isNextDay ? 86400000 : 0);
  };

  const current = potentialPrograms.find(p => nowTs >= getTs(p, 'start') && nowTs <= getTs(p, 'end')) || null;
  const referenceTs = current ? getTs(current, 'end') : nowTs;
  const future = potentialPrograms
    .filter(p => getTs(p, 'start') > referenceTs)
    .sort((a, b) => getTs(a, 'start') - getTs(b, 'start'));

  res.json({ current, next: future[0] || null });
};