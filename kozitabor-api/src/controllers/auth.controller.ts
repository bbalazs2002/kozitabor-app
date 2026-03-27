import 'dotenv/config';
import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt'
import { Secret } from "jsonwebtoken";
import { signAsync } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Hiányzó mezők!" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Érvénytelen belépési adatok!" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Érvénytelen belépési adatok!" });
    }

    const secret: Secret | undefined = process.env.JWT_SECRET;

    if (!secret) {
      console.error("HIÁNYZÓ KONFIGURÁCIÓ: JWT_SECRET nincs beállítva!");
      return res.status(500).json({ error: "Szerver konfigurációs hiba" });
    }

    // Csak a szükséges adatokat tegyük bele (ne az egész user objektumot!)
    const token = await signAsync(
      { id: user.id, email: user.email, name: user.name },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any }
    );

    return res.json({ 
      token,
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } catch (error) {
    return res.status(500).json({ error: "Szerver hiba a bejelentkezés során" });
  }
};

export const getSession = async (req: Request, res: Response) => {
  // Feltételezzük, hogy az 'authenticateToken' middleware már lefutott
  // és beállította a req.user-t a token tartalma alapján.
  if (!req.user) {
    return res.status(401).json({ user: null });
  }
  
  res.json({ user: req.user });
};

export const logout = async (_req: Request, res: Response) => {
  /**
   * Bearer Token esetén a szerveroldali logout általában csak egy válasz, 
   * mivel stateless (állapotmentes) hitelesítést használunk.
   * A kliensnek kell törölnie a tokent a tárolóból.
   */
  return res.json({ 
    success: true, 
    message: "Sikeres kijelentkezés. Kérjük, töröld a tokent kliensoldalon!" 
  });
};