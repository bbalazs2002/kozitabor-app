import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';

// --- Segédfüggvény ---
const normalizeToUtcNoon = (dateInput: string | Date): Date => {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0, 0));
};

// --- INFO (Speciális Map kezelés) ---
export const createInfo = async (req: Request, res: Response) => {
  const { title, icon, content, map } = req.body;
  const newNode = await prisma.info.create({
    data: {
      title, icon, content,
      map: map?.show ? {
        create: {
          lat: Number(map.lat),
          lng: Number(map.lng),
          zoom: Number(map.zoom),
          title: title
        }
      } : undefined
    },
    include: { map: true }
  });
  res.status(201).json(newNode);
};
export const updateInfo = async (req: Request, res: Response) => {
  const id = req.parsedId;
  const { title, icon, content, map } = req.body;

  // 1. Térkép törlése, ha kikapcsolták
  if (map && !map.show) {
    await prisma.map.deleteMany({ where: { infoId: id } });
  }

  // 2. Frissítés és opcionális Map upsert
  const updated = await prisma.info.update({
    where: { id },
    data: {
      title, icon, content,
      ...(map?.show && {
        map: {
          upsert: {
            create: { lat: map.lat, lng: map.lng, zoom: map.zoom, title },
            update: { lat: map.lat, lng: map.lng, zoom: map.zoom, title }
          }
        }
      })
    },
    include: { map: true }
  });
  res.json(updated);
};

// --- TEAMS (Kapcsolótábla kezelése) ---
export const createTeam = async (req: Request, res: Response) => {
  const { name, leaderIds } = req.body;
  const node = await prisma.team.create({
    data: {
      name,
      leaders: {
        create: (leaderIds || []).map((cId: number) => ({
          contact: { connect: { id: Number(cId) } }
        }))
      }
    },
    include: { leaders: { include: { contact: true } } }
  });
  res.status(201).json(node);
};
export const updateTeam = async (req: Request, res: Response) => {
  const { name, leaderIds } = req.body;
  const updated = await prisma.team.update({
    where: { id: req.parsedId },
    data: {
      name,
      leaders: {
        deleteMany: {},
        create: (leaderIds || []).map((cId: number) => ({
          contact: { connect: { id: Number(cId) } }
        }))
      }
    },
    include: { leaders: { include: { contact: true } } }
  });
  res.json(updated);
};

// --- TASKS (Ciklusos/Tranzakciós mentés) ---
export const createTask = async (req: Request, res: Response) => {
  const { day, timeOffset, teamIds, activityIds } = req.body;
  const utcDay = normalizeToUtcNoon(day);
  const createdTasks = [];

  for (const tId of teamIds) {
    for (const aId of activityIds) {
      const teamId = Number(tId);
      const activityId = Number(aId);
      const offset = Number(timeOffset);

      // 1. Ellenőrizzük, létezik-e már pontosan ez a bejegyzés
      // Mivel nincs unique constraint, a findFirst-et használjuk
      const existing = await prisma.task.findFirst({
        where: {
          day: utcDay,
          timeOffset: offset,
          teamId: teamId,
          activityId: activityId
        }
      });

      // 2. Csak akkor hozzuk létre, ha még nem létezik
      if (!existing) {
        const newTask = await prisma.task.create({
          data: {
            day: utcDay,
            timeOffset: offset,
            teamId: teamId,
            activityId: activityId
          },
          include: { team: true, activity: true }
        });
        createdTasks.push(newTask);
      }
    }
  }

  // Visszaküldjük az újonnan létrehozott elemeket
  res.status(201).json(createdTasks);
};

// --- PROGRAMS (Dátum normalizálás) ---
export const createProgram = async (req: Request, res: Response) => {
  const { startDay, startTimeOffset, endDay, endTimeOffset, title, desc } = req.body;
  const node = await prisma.program.create({
    data: {
      title, desc,
      startTimeOffset: Number(startTimeOffset),
      endTimeOffset: Number(endTimeOffset),
      startDay: normalizeToUtcNoon(startDay),
      endDay: normalizeToUtcNoon(endDay),
    }
  });
  res.status(201).json(node);
};
export const updateProgram = async (req: Request, res: Response) => {
  const { startDay, startTimeOffset, endDay, endTimeOffset, title, desc } = req.body;
  const updated = await prisma.program.update({
    where: { id: req.parsedId },
    data: {
      title, desc,
      startTimeOffset: Number(startTimeOffset),
      endTimeOffset: Number(endTimeOffset),
      startDay: normalizeToUtcNoon(startDay),
      endDay: normalizeToUtcNoon(endDay),
    }
  });
  res.json(updated);
};

// --- DASHBOARD (Összetett aggregáció) ---
export const GetDashboard = async (_req: Request, res: Response) => {
  const [teamCount, taskCount, contactCount, infoCount, activities, teams, upcoming] = await Promise.all([
    prisma.team.count(),
    prisma.task.count(),
    prisma.contact.count(),
    prisma.info.count(),
    prisma.activity.findMany({ include: { _count: { select: { tasks: true } } } }),
    prisma.team.findMany({ include: { _count: { select: { tasks: true } } } }),
    prisma.program.findMany({
      where: { startDay: { gte: new Date() } },
      take: 5,
      orderBy: { startDay: 'asc' }
    })
  ]);

  res.json({
    stats: { totalTeams: teamCount, totalTasks: taskCount, totalLeaders: contactCount, activeInfoCards: infoCount },
    activityDistribution: activities.map((a: any) => ({ name: a.title, count: a._count.tasks })),
    teamWorkload: teams.map((t: any) => ({ teamName: t.name, taskCount: t._count.tasks })),
    upcomingPrograms: upcoming
  });
};