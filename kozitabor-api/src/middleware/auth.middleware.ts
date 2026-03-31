import { type Request, type Response, type NextFunction } from "express";
import jwt, { type Secret } from 'jsonwebtoken';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  // A fejléc formátuma: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Hozzáférés megtagadva. Nincs token." });
  }

  const secret: Secret | undefined = process.env.JWT_SECRET;

  if (!secret) {
    console.error("HIÁNYZÓ KONFIGURÁCIÓ: JWT_SECRET nincs beállítva!");
    return res.status(500).json({ error: "Szerver hiba" });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      // 401-et érdemesebb adni, ha lejárt vagy hibás a token
      return res.status(401).json({ error: "Érvénytelen vagy lejárt token." });
    }

    // A 'decoded' tartalmazza a login-nál belepakolt id-t, email-t, name-et
    // Kényszerítjük a típust, hogy az Express Request elfogadja
    req.user = decoded as any; 
    
    next(); 
  });
};
