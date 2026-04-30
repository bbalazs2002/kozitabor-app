import { z } from 'zod';

const isoDate = z.string().refine(v => !isNaN(Date.parse(v)), { message: 'Érvénytelen dátum formátum.' });

export const deadlineSchema = z.object({
  label: z.string().min(1, 'A megnevezés kötelező.'),
  date: isoDate,
});

export const settingSchema = z.object({
  label: z.string().min(1, 'A megnevezés kötelező.'),
  value: z.string().optional().default(''),
});

export const teamSchema = z.object({
  name: z.string().min(1, 'A csapat neve kötelező.'),
  leaderIds: z.array(z.number().int().positive()).optional().default([]),
});

export const camperTaskSchema = z.object({
  day: isoDate,
  timeOffset: z.number().int().min(0),
  teamIds: z.array(z.number().int().positive()).min(1, 'Legalább egy csapat szükséges.'),
  activityIds: z.array(z.number().int().positive()).min(1, 'Legalább egy tevékenység szükséges.'),
});

export const organizerTaskSchema = z.object({
  day: isoDate,
  timeOffset: z.number().int().min(0),
  contactIds: z.array(z.number().int().positive()).min(1, 'Legalább egy szervező szükséges.'),
  activityIds: z.array(z.number().int().positive()).min(1, 'Legalább egy tevékenység szükséges.'),
});

export const programSchema = z.object({
  title: z.string().min(1, 'A cím kötelező.'),
  desc: z.string().optional(),
  startDay: isoDate,
  startTimeOffset: z.number().int().min(0),
  endDay: isoDate,
  endTimeOffset: z.number().int().min(0),
});

export const bulkContactsSchema = z.array(
  z.object({
    name: z.string().min(1, 'A név kötelező.'),
    tel: z.string().optional(),
  })
).min(1, 'Legalább egy kontakt szükséges.');
