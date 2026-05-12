import { type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getLivePrograms = async (_req: Request, res: Response) => {
  const now = new Date();
  const nowTs = now.getTime();

  // Lekérünk egy tágabb intervallumot (tegnapelőttől holnapig)
  const potentialPrograms = await prisma.program.findMany({
    where: {
      AND: [
        { startDay: { lte: new Date(nowTs + 24 * 60 * 60 * 1000) } },
        { endDay: { gte: new Date(nowTs - 2 * 24 * 60 * 60 * 1000) } },
      ],
    },
  });

  const getTs = (p: any, type: "start" | "end") => {
    const d = new Date(type === "start" ? p.startDay : p.endDay);
    const midnight = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    return midnight + (type === "start" ? p.startTimeOffset : p.endTimeOffset) * 1000;
  };

  const current =
    potentialPrograms.find(
      (p) => nowTs >= getTs(p, "start") && nowTs <= getTs(p, "end")
    ) || null;
  const referenceTs = current ? getTs(current, "end") : nowTs;
  const future = potentialPrograms
    .filter((p) => getTs(p, "start") > referenceTs)
    .sort((a, b) => getTs(a, "start") - getTs(b, "start"));

  res.json({ current, next: future[0] || null });
};
