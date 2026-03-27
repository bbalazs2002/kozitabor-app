import 'dotenv/config';
import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';

// --- INFO & MAP ---
export const getInfos = async (_req: Request, res: Response) => {
    try {
    const infos = await prisma.info.findMany({
      orderBy: {
        id: 'desc'
      },
      select: {
        id: true,
        title: true,
        icon: true
      }
    });
    res.json(infos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Hiba az infók lekérésekor" });
  }
};
export const getInfo = async (req: Request, res: Response) => {
    try {
        const id = parseInt(String(req.params.id || "0"), 10);

        // Ellenőrizzük, hogy érvényes számot kaptunk-e
        if (isNaN(id) || id <= 0) {
            res.status(400).json({ error: "Érvénytelen ID" });
            return;
        }

        const info = await prisma.info.findUnique({
            where: { id: id },
            include: { map: true }
        });

        res.json(info);
    } catch (error) {
        console.error("Hiba az infó lekérésekor:", error);
        res.status(500).json({ error: "Szerver hiba" });
    }
};

// --- CONTACTS ---
export const getContacts = async (_req: Request, res: Response) => {
    const contacts = await prisma.contact.findMany({
        orderBy: { ordering: 'asc' }
    });
    res.json(contacts);
}

// --- MIT HOZZ ---
export const getBring = async (_req: Request, res: Response) => {
    const items = await prisma.bring.findMany({
        orderBy: { title: 'asc' }
    });
    res.json(items);
};

// --- CSOPORT ---
export const getTeams = async (_req: Request, res: Response) => {
    const teams = await prisma.team.findMany({
        orderBy: {
            name: 'asc'
        },
        include: {
            leaders: {
                orderBy: {
                    contact: {
                        name: 'asc'
                    }
                },
                include: {
                    contact: true
                }
            }
        }
    });
    res.json(teams);
};

// --- TASKS (Beosztás) ---
export const getTasks = async (_req: Request, res: Response) => {
    const tasks = await prisma.task.findMany({
        include: {
            team: true,
            activity: true
        },
        orderBy: [
            { day: 'asc' },
            { timeOffset: 'asc' }
        ]
    });
    res.json(tasks);
}

// --- PROGRAMS ---
export const getPrograms = async (_req: Request, res: Response) => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: [
        {startDay: 'asc'},
        {startTimeOffset: 'asc'}
      ]
    });

    res.json(programs);
  } catch (error) {
    console.error("Hiba a programok listázásakor:", error);
    res.status(500).json({ error: "Nem sikerült lekérni a programokat." });
  }
};
export const getProgram = async (req: Request, res: Response) => {
    try {
        const id = parseInt(String(req.params.id || "0"), 10);

        // Ellenőrizzük, hogy érvényes számot kaptunk-e
        if (isNaN(id) || id <= 0) {
            res.status(400).json({ error: "Érvénytelen ID" });
            return;
        }

        const info = await prisma.program.findUnique({
            where: { id: id }
        });

        res.json(info);
    } catch (error) {
        console.error("Hiba az program lekérésekor:", error);
        res.status(500).json({ error: "Szerver hiba" });
    }
}
export const getLivePrograms = async (_req: Request, res: Response) => {
  try {
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

    // Segédfüggvény az időpont kiszámolására milliszekundumban
    const getProgramStartTs = (p: typeof potentialPrograms[0]) => {
    const d = new Date(p.startDay);
    const midnightUtcTs = Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        0, 0, 0, 0
    );
    return midnightUtcTs + (p.startTimeOffset * 1000);
    };

    const getProgramEndTs = (p: typeof potentialPrograms[0]) => {
    const d = new Date(p.startDay);
    const midnightUtcTs = Date.UTC(
        d.getUTCFullYear(),
        d.getUTCMonth(),
        d.getUTCDate(),
        0, 0, 0, 0
    );

        // Ha az endTimeOffset kisebb, mint a startTimeOffset, akkor átnyúlik a következő napra
        if (p.endTimeOffset < p.startTimeOffset) {
            return midnightUtcTs + (p.endTimeOffset * 1000) + 24 * 60 * 60 * 1000; // +1 nap
        } else {
            return midnightUtcTs + (p.endTimeOffset * 1000);
        }
    };

    // 1. Aktuális program keresése
    const currentProgram = potentialPrograms.find(p => {
      const startTs = getProgramStartTs(p);
      const endTs = getProgramEndTs(p);
      return nowTs >= startTs && nowTs <= endTs;
    }) || null;

    // 2. Következő program keresése
    let nextProgram = null;

    if (currentProgram) {
      const currentProgramEndTs = getProgramEndTs(currentProgram);
      // Olyan programok, amelyek a jelenlegi program után kezdődnek
      const futurePrograms = potentialPrograms
        .filter(p => getProgramStartTs(p) > currentProgramEndTs)
        .sort((a, b) => getProgramStartTs(a) - getProgramStartTs(b));
      nextProgram = futurePrograms.length > 0 ? futurePrograms[0] : null;
    } else {
      // Ha nincs aktuális program, akkor a legközelebbi jövőbeli program
      const futurePrograms = potentialPrograms
        .filter(p => getProgramStartTs(p) > nowTs)
        .sort((a, b) => getProgramStartTs(a) - getProgramStartTs(b));
      nextProgram = futurePrograms.length > 0 ? futurePrograms[0] : null;
    }

    res.json({ current: currentProgram, next: nextProgram });

  } catch (error) {
    console.error("Hiba:", error);
    res.status(500).json({ error: "Szerver hiba" });
  }
};
