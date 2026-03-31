import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { idParamMiddleware } from '../middleware/param.middleware.js';
import { ControllerFactory as CF } from '../utils/controllerFactory.js';
import { activityService, bringService, contactService, infoService, programService, taskService, teamService } from '../services/admin/index.js';

const router = Router();

// middlewares
router.use(requireAuth);
router.param('id', idParamMiddleware);

// error handling
const catchAsync = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);

// --- INFO & MAP ---
router.get('/info', catchAsync(CF.getAll(infoService, { include: { map: true }, orderBy: { id: 'desc' } })));
router.get('/info/:id', catchAsync(CF.getOne(infoService, { map: true })));
router.post('/info', catchAsync(adminController.createInfo)); // Egyedi logika (térkép create)
router.put('/info/:id', catchAsync(adminController.updateInfo)); // Egyedi logika (térkép upsert)
router.delete('/info/:id', catchAsync(CF.delete(infoService)));

// --- CONTACT ---
router.get('/contact', catchAsync(CF.getAll(contactService, { orderBy: { ordering: 'asc' } })));
router.get('/contact/:id', catchAsync(CF.getOne(contactService)));
router.post('/contact', catchAsync(CF.create(contactService)));
router.put('/contact/:id', catchAsync(CF.update(contactService)));
router.post('/contact/reorder', catchAsync(CF.reorder(contactService)));
router.delete('/contact/:id', catchAsync(CF.delete(contactService)));

// --- TEAMS ---
router.get('/team', catchAsync(CF.getAll(teamService, { orderBy: { name: 'asc' } })));
router.get('/team/:id', catchAsync(CF.getOne(teamService, { leaders: { include: { contact: true } } })));
router.post('/team', catchAsync(adminController.createTeam)); // Egyedi logika (kapcsolódó tábla)
router.put('/team/:id', catchAsync(adminController.updateTeam)); // Egyedi logika (kapcsolódó tábla)
router.delete('/team/:id', catchAsync(CF.delete(teamService)));

// --- ACTIVITIES ---
router.get('/activity', catchAsync(CF.getAll(activityService, { orderBy: { title: 'asc' } })));
router.get('/activity/:id', catchAsync(CF.getOne(activityService)));
router.post('/activity', catchAsync(CF.create(activityService)));
router.put('/activity/:id', catchAsync(CF.update(activityService)));
router.delete('/activity/:id', catchAsync(CF.delete(activityService)));

// --- TASKS ---
router.get('/task', catchAsync(CF.getAll(taskService, { include: { team: true, activity: true }, orderBy: [{ day: 'asc' }, { timeOffset: 'asc' }] })));
router.get('/task/:id', catchAsync(CF.getOne(taskService)));
router.post('/task', catchAsync(adminController.createTask)); // Egyedi logika (ciklusos mentés)
router.delete('/task/:id', catchAsync(CF.delete(taskService)));

// --- BRING ---
router.get('/bring', catchAsync(CF.getAll(bringService, { orderBy: { title: 'asc' } })));
router.post('/bring', catchAsync(CF.create(bringService)));
router.delete('/bring/:id', catchAsync(CF.delete(bringService)));

// --- PROGRAM ---
router.get('/program', catchAsync(CF.getAll(programService, { orderBy: [{ startDay: 'asc' }, { startTimeOffset: 'asc' }] })));
router.get('/program/:id', catchAsync(CF.getOne(programService)));
router.post('/program', catchAsync(adminController.createProgram)); // Egyedi logika (dátum normalizálás)
router.put('/program/:id', catchAsync(adminController.updateProgram)); // Egyedi logika (dátum normalizálás)
router.delete('/program/:id', catchAsync(CF.delete(programService)));

// --- DASHBOARD ---
router.get('/dashboard', catchAsync(adminController.GetDashboard)); // Egyedi statisztikai lekérés

export default router;