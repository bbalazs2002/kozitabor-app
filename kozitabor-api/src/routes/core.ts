import { Router } from 'express';
import * as coreCtrl from '../controllers/core.controller.js';
import { idParamMiddleware } from '../middleware/param.middleware.js';
import { ControllerFactory as CF } from '../utils/controllerFactory.js';
import { 
  infoService, contactService, teamService, 
  bringService, taskService, programService 
} from '../services/core/index.js';

const router = Router();
const catchAsync = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

// Globális ID validálás
router.param('id', idParamMiddleware);

// --- INFO & MAP ---
router.get('/info',     catchAsync(CF.getAll(infoService, { select: { id: true, title: true, icon: true }, orderBy: { id: 'desc' } })));
router.get('/info/:id', catchAsync(CF.getOne(infoService, { map: true })));

// --- CONTACTS ---
router.get('/contact',  catchAsync(CF.getAll(contactService, { orderBy: { ordering: 'asc' } })));

// --- BRING ---
router.get('/bring',    catchAsync(CF.getAll(bringService, { orderBy: { title: 'asc' } })));

// --- TEAMS ---
router.get('/team',     catchAsync(CF.getAll(teamService, {
  orderBy: { name: 'asc' },
  include: {
    leaders: {
      orderBy: { contact: { name: 'asc' } },
      include: { contact: true }
    }
  }
})));
router.get('/team/:id', catchAsync(CF.getOne(teamService, {
  leaders: {
    orderBy: { contact: { name: 'asc' } },
    include: { contact: true }
  }
})));

// --- BEOSZTÁS (TASKS) ---
router.get('/task',     catchAsync(CF.getAll(taskService, {
  include: { team: true, activity: true },
  orderBy: [{ day: 'asc' }, { timeOffset: 'asc' }]
})));

// --- PROGRAMOK ---
router.get('/program',      catchAsync(CF.getAll(programService, { orderBy: [{ startDay: 'asc' }, { startTimeOffset: 'asc' }] })));
router.get('/liveProgram', catchAsync(coreCtrl.getLivePrograms)); // Egyedi metódus a kontrollerből
router.get('/program/:id',  catchAsync(CF.getOne(programService)));

export default router;