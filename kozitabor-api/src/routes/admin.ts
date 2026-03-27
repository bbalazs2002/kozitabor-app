import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// --- INFO & MAP ---
router.get('/info', adminController.getInfos);
router.get('/info/:id', adminController.getInfo);
router.post('/info', adminController.createInfo);
router.put('/info/:id', adminController.updateInfo);
router.delete('/info/:id', adminController.removeInfo);

// --- CONTACT ---
router.get('/contact', adminController.getContacts);
router.get('/contact/:id', adminController.getContact);
router.post('/contact', adminController.createContact);
router.put('/contact/:id', adminController.updateContact);
router.post('/contact/reorder', adminController.reorderContacts);
router.delete('/contact/:id', adminController.removeContact);

// --- TEAMS ---
router.get('/team', adminController.getTeams);
router.get('/team/:id', adminController.getTeam);
router.post('/team', adminController.createTeam);
router.put('/team/:id', adminController.updateTeam);
router.delete('/team/:id', adminController.removeTeam);

// --- ACTIVITIES ---
router.get('/activity', adminController.getActivities);
router.get('/activity/:id', adminController.getActivity);
router.post('/activity', adminController.createActivity);
router.put('/activity/:id', adminController.updateActivity);
router.delete('/activity/:id', adminController.removeActivity);

// --- TASKS ---
router.get('/task', adminController.getTasks);
router.get('/task/:id', adminController.getTask);
router.post('/task', adminController.createTask);
router.delete('/task/:id', adminController.removeTask);

// --- BRING ---
router.get('/bring', adminController.getBrings);
router.post('/bring', adminController.createBring);
router.delete('/bring/:id', adminController.removeBring);

// --- PROGRAM ---
router.get('/program', adminController.getPrograms);
router.get('/program/:id', adminController.getProgram);
router.post('/program', adminController.createProgram);
router.put('/program/:id', adminController.updateProgram);
router.delete('/program/:id', adminController.removeProgram);

// --- DASHBOARD ---
router.get('/dashboard', adminController.GetDashboard);

export default router;