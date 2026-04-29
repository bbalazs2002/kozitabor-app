import { prisma } from '../../lib/prisma.js';
import { createBaseService } from '../../services/base.service.js';

export const userService = createBaseService(prisma.user);
export const contactService = createBaseService(prisma.contact);
export const roleService = createBaseService(prisma.role);
export const bringService = createBaseService(prisma.bring);
export const programService = createBaseService(prisma.program);
export const infoService = createBaseService(prisma.info);
// export const mapService = createBaseService(prisma.map);             // managed through info
// export const mediaService = createBaseService(prisma.media);         // managed through info
export const teamService = createBaseService(prisma.team);
export const camperService = createBaseService(prisma.camper);
export const camperActivityService = createBaseService(prisma.camperActivity);
export const camperTaskService = createBaseService(prisma.camperTask);
export const organizerActivityService = createBaseService(prisma.organizerActivity);
export const organizerTaskService = createBaseService(prisma.organizerTask);
// export const leaderService = createBaseService(prisma.leader);       // managed through team
export const settingService = createBaseService(prisma.setting);
export const deadlineService = createBaseService(prisma.deadline);