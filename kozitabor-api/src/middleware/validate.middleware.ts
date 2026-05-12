import { NextFunction, Request, Response } from "express";
import { ZodIssue, ZodSchema } from "zod";

export const validateBody =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: "Érvénytelen adatok.",
        details: result.error.issues.map((e: ZodIssue) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }
    req.body = result.data;
    next();
  };
