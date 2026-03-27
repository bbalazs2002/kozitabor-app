import { Router } from 'express';
import * as coreController from '../controllers/core.controller.js';

const router = Router();

// --- INFO & MAP ---
router.get('/info', coreController.getInfos);
router.get('/info/detail/:id', coreController.getInfo);

// --- CONTACTS ---
router.get('/contacts', coreController.getContacts);

// --- MIT HOZZ ---
router.get('/bring', coreController.getBring);

// --- CSOPORT ---
router.get('/teams', coreController.getTeams);

// --- TASKS (Beosztás) ---
router.get('/tasks', coreController.getTasks);

// --- PROGRAMS ---
router.get('/programs', coreController.getPrograms);
router.get('/program/:id', coreController.getProgram);
router.get('/livePrograms', coreController.getLivePrograms);

export default router;