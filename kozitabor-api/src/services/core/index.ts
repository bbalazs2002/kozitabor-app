import { prisma } from '../../lib/prisma.js';
import { createBaseService } from '../../services/base.service.js';

export const infoService            = createBaseService(prisma.info);
export const contactService         = createBaseService(prisma.contact);
export const teamService            = createBaseService(prisma.team);
export const camperTaskService      = createBaseService(prisma.camperTask);
export const bringService           = createBaseService(prisma.bring);
export const programService         = createBaseService(prisma.program);
export const settingService         = createBaseService(prisma.setting);
export const deadlineService        = createBaseService(prisma.deadline);