import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { loginLimiter } from "../middleware/rateLimiter.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { loginSchema } from "../schemas/auth.schemas.js";

const router = Router();

router.post("/login", loginLimiter, validateBody(loginSchema), authController.login);
router.get("/session", requireAuth, authController.getSession);
router.post("/logout", authController.logout);

export default router;
