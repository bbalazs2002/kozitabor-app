import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { idParamMiddleware } from "../middleware/param.middleware.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import {
  bulkContactsSchema,
  camperTaskSchema,
  deadlineSchema,
  organizerTaskSchema,
  programSchema,
  settingSchema,
  teamSchema,
} from "../schemas/admin.schemas.js";
import {
  bringService,
  camperActivityService,
  camperService,
  camperTaskService,
  contactService,
  deadlineService,
  infoService,
  organizerActivityService,
  organizerTaskService,
  programService,
  roleService,
  settingService,
  teamService,
} from "../services/admin/index.js";
import { ControllerFactory as CF } from "../utils/controllerFactory.js";

const router = Router();

// middlewares
router.use(requireAuth);
router.param("id", idParamMiddleware);

// error handling
const catchAsync = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// --- INFO & MAP & Media ---
router.get(
  "/info",
  catchAsync(
    CF.getAll(infoService, {
      include: { map: true, media: true },
      orderBy: { id: "desc" },
    })
  )
);
router.get("/info/:id", catchAsync(CF.getOne(infoService, { map: true, media: true })));

router.post(
  "/info",
  uploadMiddleware.array("files"),
  catchAsync(adminController.createInfo)
); // Egyedi logika: térkép + média mentés
router.put(
  "/info/:id",
  uploadMiddleware.array("files"),
  catchAsync(adminController.updateInfo)
); // Egyedi logika: térkép + média upsert

router.delete("/info/:id", catchAsync(CF.delete(infoService)));

// --- CONTACT & ROLES ---
router.get(
  "/contact",
  catchAsync(
    CF.getAll(contactService, { include: { role: true }, orderBy: { ordering: "asc" } })
  )
);
router.get("/contact/:id", catchAsync(CF.getOne(contactService, { role: true })));
router.post("/contact", catchAsync(CF.create(contactService)));
router.post(
  "/contact/bulk",
  validateBody(bulkContactsSchema),
  catchAsync(adminController.bulkCreateContacts)
);
router.put("/contact/:id", catchAsync(CF.update(contactService)));
router.post("/contact/reorder", catchAsync(CF.reorder(contactService)));
router.delete("/contact/:id", catchAsync(CF.delete(contactService)));

router.get("/role", catchAsync(CF.getAll(roleService, { orderBy: { name: "asc" } })));
router.post("/role", catchAsync(CF.create(roleService)));
router.delete("/role/:id", catchAsync(CF.delete(roleService)));

// --- TEAMS & CAMPERS ---
router.get(
  "/team",
  catchAsync(
    CF.getAll(teamService, {
      include: { leaders: { include: { contact: true } } },
      orderBy: { name: "asc" },
    })
  )
);
router.get(
  "/team/:id",
  catchAsync(
    CF.getOne(teamService, { leaders: { include: { contact: true } }, campers: true })
  )
);
router.post("/team", validateBody(teamSchema), catchAsync(adminController.createTeam));
router.put("/team/:id", validateBody(teamSchema), catchAsync(adminController.updateTeam));
router.delete("/team/:id", catchAsync(CF.delete(teamService)));

router.get(
  "/camper",
  catchAsync(
    CF.getAll(camperService, { include: { team: true }, orderBy: { name: "asc" } })
  )
);
router.post("/camper", catchAsync(CF.create(camperService)));
router.put("/camper/:id", catchAsync(CF.update(camperService)));
router.delete("/camper/:id", catchAsync(CF.delete(camperService)));

// --- CAMPER ACTIVITIES ---
router.get(
  "/camper-activity",
  catchAsync(CF.getAll(camperActivityService, { orderBy: { title: "asc" } }))
);
router.get("/camper-activity/:id", catchAsync(CF.getOne(camperActivityService)));
router.post("/camper-activity", catchAsync(CF.create(camperActivityService)));
router.put("/camper-activity/:id", catchAsync(CF.update(camperActivityService)));
router.delete("/camper-activity/:id", catchAsync(CF.delete(camperActivityService)));

// --- CAMPER TASKS ---
router.get(
  "/camper-task",
  catchAsync(
    CF.getAll(camperTaskService, {
      include: { team: true, camperActivity: true },
      orderBy: [{ day: "asc" }, { timeOffset: "asc" }],
    })
  )
);
router.get(
  "/camper-task/:id",
  catchAsync(
    CF.getOne(camperTaskService, { include: { team: true, camperActivity: true } })
  )
);
router.post(
  "/camper-task",
  validateBody(camperTaskSchema),
  catchAsync(adminController.createCamperTask)
);
router.delete("/camper-task/:id", catchAsync(CF.delete(camperTaskService)));

// --- ORGANIZER ACTIVITIES ---
router.get(
  "/organizer-activity",
  catchAsync(CF.getAll(organizerActivityService, { orderBy: { title: "asc" } }))
);
router.get("/organizer-activity/:id", catchAsync(CF.getOne(organizerActivityService)));
router.post("/organizer-activity", catchAsync(CF.create(organizerActivityService)));
router.put("/organizer-activity/:id", catchAsync(CF.update(organizerActivityService)));
router.delete("/organizer-activity/:id", catchAsync(CF.delete(organizerActivityService)));

// --- ORGANIZER TASKS ---
router.get(
  "/organizer-task",
  catchAsync(
    CF.getAll(organizerTaskService, {
      include: { contact: true, organizerActivity: true },
      orderBy: [{ day: "asc" }, { timeOffset: "asc" }],
    })
  )
);
router.get(
  "/organizer-task/:id",
  catchAsync(
    CF.getOne(organizerTaskService, {
      include: { contact: true, organizerActivity: true },
    })
  )
);
router.post(
  "/organizer-task",
  validateBody(organizerTaskSchema),
  catchAsync(adminController.createOrganizerTask)
);
router.delete("/organizer-task/:id", catchAsync(CF.delete(organizerTaskService)));

// --- BRING ---
router.get("/bring", catchAsync(CF.getAll(bringService, { orderBy: { title: "asc" } })));
router.post("/bring", catchAsync(CF.create(bringService)));
router.put("/bring/:id", catchAsync(CF.update(bringService)));
router.delete("/bring/:id", catchAsync(CF.delete(bringService)));

// --- PROGRAM ---
router.get(
  "/program",
  catchAsync(
    CF.getAll(programService, {
      orderBy: [{ startDay: "asc" }, { startTimeOffset: "asc" }],
    })
  )
);
router.get("/program/:id", catchAsync(CF.getOne(programService)));
router.post(
  "/program",
  validateBody(programSchema),
  catchAsync(adminController.createProgram)
);
router.put(
  "/program/:id",
  validateBody(programSchema),
  catchAsync(adminController.updateProgram)
);
router.delete("/program/:id", catchAsync(CF.delete(programService)));

// --- SETTINGS ---
router.get(
  "/setting",
  catchAsync(CF.getAll(settingService, { orderBy: { label: "asc" } }))
);
router.get("/setting/:id", catchAsync(CF.getOne(settingService)));
router.post(
  "/setting",
  validateBody(settingSchema),
  catchAsync(adminController.createSetting)
);
router.put("/setting/:id", catchAsync(CF.update(settingService)));
router.delete("/setting/:id", catchAsync(CF.delete(settingService)));

// --- DEADLINES ---
router.get(
  "/deadline",
  catchAsync(CF.getAll(deadlineService, { orderBy: { date: "asc" } }))
);
router.get("/deadline/:id", catchAsync(CF.getOne(deadlineService)));
router.post(
  "/deadline",
  validateBody(deadlineSchema),
  catchAsync(adminController.createDeadline)
);
router.put(
  "/deadline/:id",
  validateBody(deadlineSchema),
  catchAsync(adminController.updateDeadline)
);
router.delete("/deadline/:id", catchAsync(CF.delete(deadlineService)));

// --- DASHBOARD ---
// router.get('/dashboard', catchAsync(adminController.GetDashboard)); // Egyedi statisztikai lekérés

export default router;
