import { type Request, type Response } from 'express';

// 1. Típus kiterjesztés helyben, hogy a factory biztosan lássa
declare global {
  namespace Express {
    interface Request {
      parsedId: number;
    }
  }
}

// Segédfüggvény a biztonságos ID kinyeréshez
const getParsedId = (req: Request): number => req.parsedId;

export const ControllerFactory = {
  // Összes lekérése
  getAll: (service: any, options: any = {}) => 
    async (_req: Request, res: Response) => {
      const data = await service.getAll(options);
      return res.json(data);
    },

  // Egy darab lekérése
  getOne: (service: any, include?: any) => 
    async (req: Request, res: Response) => {
      const data = await service.getById(getParsedId(req), include);
      if (!data) return res.status(404).json({ error: "Nem található" });
      return res.json(data);
    },

  // Létrehozás
  create: (service: any) => 
    async (req: Request, res: Response) => {
      const data = await service.create(req.body);
      return res.status(201).json(data);
    },

  // Frissítés
  update: (service: any) => 
    async (req: Request, res: Response) => {
      const data = await service.update(getParsedId(req), req.body);
      return res.json(data);
    },

  // Törlés
  delete: (service: any) => 
    async (req: Request, res: Response) => {
      await service.delete(getParsedId(req));
      return res.json({ success: true, id: getParsedId(req) });
    },

  // Újrarendezés
  reorder: (service: any, orderField?: string) => 
    async (req: Request, res: Response) => {
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ error: "ID lista szükséges" });
      }
      await service.reorder(req.body, orderField);
      return res.json({ success: true });
    }
};