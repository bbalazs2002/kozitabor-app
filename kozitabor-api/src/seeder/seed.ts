import 'dotenv/config';
import { prisma } from '../lib/prisma';

const getNoonDate = (daysFromNow: number) => {
  const d = new Date();
  // Kiszámoljuk az adott napot, de UTC 12:00-ra állítjuk
  // Date.UTC(year, month, day, hour, min, sec)
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate() + daysFromNow,
    12, 0, 0, 0
  ));
};

/**
 * Segédfüggvény: "HH:mm" formátumú időpont konvertálása másodpercre az éjféltől számítva.
 * Ezt adjuk hozzá a nap elejéhez vagy használjuk offset-ként.
 */
const timeToSeconds = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return ((hours ?? 0) * 3600) + ((minutes ?? 0) * 60);
};

async function main() {
  console.log('🚀 Teljes adatbázis újratöltése folyamatban...');

  // 1. TISZTÍTÁS (Sorrend fontos a kényszerek miatt)
  if (prisma.leader) {
    await prisma.leader.deleteMany();
  }
  
  await prisma.task.deleteMany();
  await prisma.program.deleteMany();
  await prisma.info.deleteMany();
  await prisma.map.deleteMany();
  await prisma.bring.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.team.deleteMany();
  await prisma.activity.deleteMany();

  console.log('✅ Táblák kiürítve.');

  // 2. CONTACTS (10 fő)
  const contacts = await Promise.all([
    prisma.contact.create({ data: { name: 'Kovács János', tel: '+36301112233', ordering: 1 } }),
    prisma.contact.create({ data: { name: 'Nagy Piroska', tel: '+36302223344', ordering: 2 } }),
    prisma.contact.create({ data: { name: 'Kiss Árpád', tel: '+36303334455', ordering: 3 } }),
    prisma.contact.create({ data: { name: 'Tóth Beatrix', tel: '+36304445566', ordering: 4 } }),
    prisma.contact.create({ data: { name: 'Horváth Gergő', tel: '+36305556677', ordering: 5 } }),
    prisma.contact.create({ data: { name: 'Molnár Enikő', tel: '+36306667788', ordering: 6 } }),
    prisma.contact.create({ data: { name: 'Szabó Bence', tel: '+36307778899', ordering: 7 } }),
    prisma.contact.create({ data: { name: 'Varga Lilla', tel: '+36308889900', ordering: 8 } }),
    prisma.contact.create({ data: { name: 'Balogh Tamás', tel: '+36309990011', ordering: 9 } }),
    prisma.contact.create({ data: { name: 'Fekete Zsófia', tel: '+36300001122', ordering: 10 } }),
  ]);

  // 3. TEAMS (4 szín)
  const teams = await Promise.all([
    prisma.team.create({ data: { name: 'Piros' } }),
    prisma.team.create({ data: { name: 'Kék' } }),
    prisma.team.create({ data: { name: 'Zöld' } }),
    prisma.team.create({ data: { name: 'Sárga' } }),
  ]);

  // 4. LEADERS (2 vezető per csapat)
  for (let i = 0; i < teams.length; i++) {
    await prisma.leader.createMany({
      data: [
        { teamId: teams[i]!.id, contactId: contacts[i * 2]!.id },
        { teamId: teams[i]!.id, contactId: contacts[i * 2 + 1]!.id }
      ]
    });
  }

  // 5. ACTIVITIES (Konyhai feladatok - 'title' mezővel)
  const kitchenActivities = await Promise.all([
    prisma.activity.create({ data: { title: 'Reggeli készítés' } }),
    prisma.activity.create({ data: { title: 'Ebéd készítés' } }),
    prisma.activity.create({ data: { title: 'Vacsora készítés' } }),
  ]);

  // 6. TASKS (Heti konyhai beosztás rotációval, timestamp alapon)
  const kitchenTimes = ['07:00', '12:00', '18:00'];

  // 5 napos szimuláció (Mától számítva)
  for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
    const noonDate = getNoonDate(dayIdx);
    for (const [actIdx, activity] of kitchenActivities.entries()) {
      const teamIdx = (dayIdx + actIdx) % teams.length;
      await prisma.task.create({
        data: {
          day: noonDate,
          timeOffset: timeToSeconds(kitchenTimes[actIdx] ?? "00:00"),
          activityId: activity.id,
          teamId: teams[teamIdx]!.id
        }
      });
    }
  }

  // 7. BRING LIST (5 tétel)
  await prisma.bring.createMany({
    data: [
      { title: 'Zárt cipő túrázáshoz' },
      { title: 'Kulacs (min. 1 liter)' },
      { title: 'Naptej és kullancsriasztó' },
      { title: 'Hálózsák és kispárna' },
      { title: 'Fürdőruha és törölköző' },
    ]
  });

  // 8. INFO CARDS (5 rekord)
  const infoCards = [
    { title: 'Étkezés', icon: 'Utensils', content: '<h3>Napi menü</h3><p>Reggeli: 8:00<br>Ebéd: 13:00<br>Vacsora: 19:00</p>' },
    { title: 'Helyszín', icon: 'MapPin', content: '<p>A tábor bejárata a sorompó után balra található.</p>' },
    { title: 'Házirend', icon: 'ShieldCheck', content: '<p>Kérjük a takarodó (22:00) betartását!</p>' },
    { title: 'Elsősegély', icon: 'HeartPulse', content: '<p>Az orvosi szoba a főépület földszintjén található.</p>' },
    { title: 'Programokról', icon: 'Info', content: '<p>A változtatás jogát fenntartjuk.</p>' },
  ];

  // Eltároljuk a létrehozott kártyákat, hogy meglegyenek az ID-k
  const createdInfos = [];

  for (const info of infoCards) {
    const newInfo = await prisma.info.create({ data: info });
    createdInfos.push(newInfo);
  }

  // 9. MAP (1 rekord)
  const locationCard = createdInfos.find(i => i.title === 'Helyszín');

  if (locationCard) {
    await prisma.map.create({
      data: {
        title: 'Főépület és Étkező',
        lat: 47.892,
        lng: 19.985,
        zoom: 16,
        // Itt történik az összekapcsolás:
        infoId: locationCard.id 
      }
    });
  }

  // 10. PROGRAMS (Napi 3 program, szintén timestamp alapon)
  const progTemplates = [
    { startTime: '08:00', endTime: '08:30', title: 'Reggeli Torna', desc: 'Ébredés utáni átmozgatás.' },
    { startTime: '10:00', endTime: '12:00', title: 'Délelőtti Foglalkozás', desc: 'Csapatépítő játékok.' },
    { startTime: '20:00', endTime: '21:00', title: 'Esti Program', desc: 'Tábortűz és éneklés.' },
  ];

  for (let dayIdx = 0; dayIdx < 5; dayIdx++) {
    const noonDate = getNoonDate(dayIdx);
    for (const prog of progTemplates) {
      await prisma.program.create({
        data: {
          startDay: noonDate,
          startTimeOffset: timeToSeconds(prog.startTime),
          endDay: noonDate,
          endTimeOffset: timeToSeconds(prog.endTime),
          title: prog.title,
          desc: prog.desc
        }
      });
    }
  }

  console.log('✨ Minden adat sikeresen feltöltve.');
}

main()
  .catch((e) => {
    console.error('❌ Hiba a seedelés közben:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });