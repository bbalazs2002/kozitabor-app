import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// 1. Létrehozzuk a natív PG kapcsolatot
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// 2. Becsomagoljuk a Prisma adapterébe
const adapter = new PrismaPg(pool as any);

// 3. Átadjuk a kliensnek (ez az az 'adapter' mező, amit láttál a listában!)
export const prisma = new PrismaClient({ adapter });