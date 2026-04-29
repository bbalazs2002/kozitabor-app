import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import fs from 'fs';

// --- Segédfüggvények ---
const normalizeToUtcNoon = (dateInput: string | Date): Date => {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0, 0));
};

const toStrId = (label: string): string =>
  label
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');

// --- CONTACTS (bulk) ---
export const bulkCreateContacts = async (req: Request, res: Response) => {
  const contacts: { name: string; tel?: string }[] = req.body;
  if (!Array.isArray(contacts) || contacts.length === 0) {
    res.status(400).json({ error: 'Üres vagy érvénytelen adat.' });
    return;
  }
  const maxOrder = await prisma.contact.findFirst({
    orderBy: { ordering: 'desc' },
    select: { ordering: true },
  });
  let ordering = (maxOrder?.ordering ?? 0) + 1;
  await prisma.contact.createMany({
    data: contacts.map(c => ({
      name: String(c.name).trim(),
      tel:  c.tel ? String(c.tel).trim() : null,
      ordering: ordering++,
    })),
  });
  res.status(201).json({ count: contacts.length });
};

// --- DEADLINES ---
export const createDeadline = async (req: Request, res: Response) => {
  const { label, date } = req.body;
  const deadline = await prisma.deadline.create({
    data: { label, date: normalizeToUtcNoon(date) }
  });
  res.status(201).json(deadline);
};

export const updateDeadline = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { label, date } = req.body;
  const deadline = await prisma.deadline.update({
    where: { id: Number(id) },
    data: { label, date: normalizeToUtcNoon(date) }
  });
  res.json(deadline);
};

// --- SETTINGS ---
export const createSetting = async (req: Request, res: Response) => {
  const { label, value } = req.body;
  const setting = await prisma.setting.create({
    data: { str_id: toStrId(label), label, value: value ?? '' }
  });
  res.status(201).json(setting);
};

// --- INFO (Speciális Map és Media kezelés) ---
export const createInfo = async (req: Request, res: Response) => {
  const { title, icon, content } = req.body;
  const map = req.body.map ? JSON.parse(req.body.map) : null;
  const files = req.files as Express.Multer.File[];
  const createdFilePaths: string[] = [];

  try {
    const newNode = await prisma.info.create({
      data: {
        title, icon, content,
        map: map?.show ? {
          create: { lat: Number(map.lat), lng: Number(map.lng), zoom: Number(map.zoom) || 15, title }
        } : undefined,
        media: {
          create: files?.map(file => {
            createdFilePaths.push(file.path);
            return { url: file.path.replace(/\\/g, '/'), type: file.mimetype.startsWith('image/') ? 'IMAGE' : 'FILE' };
          })
        }
      },
      include: { map: true, media: true }
    });

    res.status(201).json(newNode);
  } catch (error) {
    createdFilePaths.forEach(p => { if (fs.existsSync(p)) fs.unlink(p, () => {}); });
    throw error;
  }
};

export const updateInfo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, icon, content } = req.body;
  const map = req.body.map ? JSON.parse(req.body.map) : null;
  const deletedMediaIds: number[] = req.body.deletedMediaIds
    ? JSON.parse(req.body.deletedMediaIds).map(Number)
    : [];
  const newFiles = req.files as Express.Multer.File[];

  const oldInfo = await prisma.info.findUnique({
    where: { id: Number(id) },
    include: { media: true, map: true }
  });

  if (!oldInfo) return res.status(404).json({ message: 'Nem található' });

  let mapOperation: any = undefined;
  if (map) {
    if (map.show) {
      mapOperation = {
        upsert: {
          update: { lat: Number(map.lat), lng: Number(map.lng), zoom: Number(map.zoom) },
          create: { lat: Number(map.lat), lng: Number(map.lng), zoom: Number(map.zoom), title }
        }
      };
    } else if (oldInfo.map) {
      mapOperation = { delete: true };
    }
  }

  try {
    const updatedNode = await prisma.info.update({
      where: { id: Number(id) },
      data: {
        title, icon, content,
        ...(mapOperation !== undefined ? { map: mapOperation } : {}),
        media: {
          deleteMany: deletedMediaIds.length > 0 ? { id: { in: deletedMediaIds } } : undefined,
          create: (newFiles ?? []).map(file => ({
            url: file.path.replace(/\\/g, '/'),
            type: file.mimetype.startsWith('image/') ? 'IMAGE' : 'FILE'
          }))
        }
      },
      include: { map: true, media: true }
    });

    if (deletedMediaIds.length > 0) {
      oldInfo.media
        .filter(m => deletedMediaIds.includes(m.id))
        .forEach(m => { if (fs.existsSync(m.url)) fs.unlinkSync(m.url); });
    }

    res.json(updatedNode);
  } catch (error) {
    (newFiles ?? []).forEach(f => { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); });
    throw error;
  }
};

// --- TEAMS ---
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

// --- CAMPER TASKS ---
export const createCamperTask = async (req: Request, res: Response) => {
  const { day, timeOffset, teamIds, activityIds } = req.body;
  const utcDay = normalizeToUtcNoon(day);
  const createdTasks = [];

  for (const tId of teamIds) {
    for (const aId of activityIds) {
      const teamId = Number(tId);
      const camperActivityId = Number(aId);
      const offset = Number(timeOffset);

      const existing = await prisma.camperTask.findFirst({
        where: { day: utcDay, timeOffset: offset, teamId, camperActivityId }
      });

      if (!existing) {
        const newTask = await prisma.camperTask.create({
          data: { day: utcDay, timeOffset: offset, teamId, camperActivityId },
          include: { team: true, camperActivity: true }
        });
        createdTasks.push(newTask);
      }
    }
  }

  res.status(201).json(createdTasks);
};

// --- ORGANIZER TASKS ---
export const createOrganizerTask = async (req: Request, res: Response) => {
  const { day, timeOffset, contactIds, activityIds } = req.body;
  const utcDay = normalizeToUtcNoon(day);
  const createdTasks = [];

  for (const cId of contactIds) {
    for (const aId of activityIds) {
      const contactId = Number(cId);
      const organizerActivityId = Number(aId);
      const offset = Number(timeOffset);

      const existing = await prisma.organizerTask.findFirst({
        where: { day: utcDay, timeOffset: offset, contactId, organizerActivityId }
      });

      if (!existing) {
        const newTask = await prisma.organizerTask.create({
          data: { day: utcDay, timeOffset: offset, contactId, organizerActivityId },
          include: { contact: true, organizerActivity: true }
        });
        createdTasks.push(newTask);
      }
    }
  }

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
/*
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
*/