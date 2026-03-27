import 'dotenv/config';
import express from "express";
import cors from "cors";
import coreRoutes from './routes/core.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import { prisma } from './lib/prisma';

// .env check
if (!process.env.CLIENT_URL || !process.env.CLIENT_PORT) {
  console.log("Add meg a CLIENT_URL és a CLIENT_PORT változókat az .env fájlban!");
}
if (!process.env.API_PORT) {
  console.log("Add meg az API_PORT változót az .env fájlban!");
}

// Create app
const origin = `${process.env.CLIENT_URL}:${process.env.CLIENT_PORT}`
const app = express();
app.use(cors({
  origin: origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure routes
app.use('/api', coreRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Run server and open port 5000
const PORT = process.env.API_PORT;
const server = app.listen(PORT, () => {
  console.log(`\x1b[32m%s\x1b[0m`, `🚀 TypeScript API szerver fut: http://localhost:${PORT}`);
});

// On server shotdown
const shutdown = async (signal: string) => {
  console.log(`\n${signal} érkezett. A szerver leállítása folyamatban...`);
  
  // 1. Megállítjuk az új HTTP kérések fogadását
  server.close(async () => {
    console.log("HTTP szerver lezárva.");
    
    try {
      // 2. Lezárjuk az adatbázis kapcsolatot (Prisma + PG pool)
      await prisma.$disconnect();
      console.log("Adatbázis kapcsolat sikeresen lezárva.");
      
      process.exit(0);
    } catch (err) {
      console.error("Hiba a leállás során:", err);
      process.exit(1);
    }
  });

  // Ha 10 másodperc alatt nem áll le szépen, kényszerítjük
  setTimeout(() => {
    console.error("A leállás túl sokáig tart, kényszerített kilépés...");
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));  // CTRL+C a terminálban
process.on('SIGTERM', () => shutdown('SIGTERM')); // Pl. Docker vagy Heroku leállás