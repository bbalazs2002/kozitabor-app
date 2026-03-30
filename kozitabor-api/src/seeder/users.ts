import 'dotenv/config';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
    console.log('🚀 Felhasználók újratöltése folyamatban...');

    await prisma.user.deleteMany();

    console.log('✅ User tábla kiürítve.');
    console.log('🌱 A Seed-elés elkezdődött.');

    const email = 'kozitabor.admin@mkkozi.hu';
    const hashedPassword = await bcrypt.hash("AdminPassword12345", 10);
    const admin = await prisma.user.upsert({
    where: { email: email },
    update: {}, // Ha már létezik, ne változtasson semmit
    create: {
      email: email,
      name: "Közitábor Admin",
      password: hashedPassword,
      role: "admin"
    }
  });

  console.log("✅ Admin felhasználó kész:", admin);
}

main()
  .catch((e) => {
    console.error('❌ Hiba a seedelés közben:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });