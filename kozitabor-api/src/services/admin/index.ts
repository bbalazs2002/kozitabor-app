import { prisma } from '../../lib/prisma.js';
import { createBaseService } from '../../services/base.service.js';

export const infoService     = createBaseService(prisma.info);
export const contactService  = createBaseService(prisma.contact);
export const teamService     = createBaseService(prisma.team);
export const activityService = createBaseService(prisma.activity);
export const taskService     = createBaseService(prisma.task);
export const bringService    = createBaseService(prisma.bring);
export const programService  = createBaseService(prisma.program);