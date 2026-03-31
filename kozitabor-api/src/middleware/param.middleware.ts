import { Request, Response, NextFunction } from 'express';
import { parseId } from '../utils/parser.js';

// Kiterjesztjük az Express Request interfészét, hogy a TS ne panaszkodjon
declare global {
  namespace Express {
    interface Request {
      parsedId: number;
    }
  }
}

export const idParamMiddleware = (req: Request, res: Response, next: NextFunction, value: string) => {
  try {
    req.parsedId = parseId(value);
    next();
  } catch (err: any) {
    // Itt központilag kezelheted a parsolási hibát
    return res.status(400).json({ 
      error: "Érvénytelen azonosító formátum", 
      message: err.message 
    });
  }
};