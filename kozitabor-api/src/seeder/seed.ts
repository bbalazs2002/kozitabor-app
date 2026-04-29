import 'dotenv/config';
import { prisma } from '../lib/prisma';

// Tábor 2026-07-14-én kezdődik (0-indexed month: 6 = július)
const CAMP_START_YEAR = 2026;
const CAMP_START_MONTH = 6; // július
const CAMP_START_DAY = 14;

const getCampDate = (dayOffset: number) => new Date(Date.UTC(
  CAMP_START_YEAR, CAMP_START_MONTH, CAMP_START_DAY + dayOffset, 12, 0, 0, 0
));

const getFixedDate = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));

const timeToSeconds = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return ((hours ?? 0) * 3600) + ((minutes ?? 0) * 60);
};

async function main() {
  console.log('🚀 Adatbázis újratöltése...');

  // 1. TISZTÍTÁS
  await prisma.deadline.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.media.deleteMany();
  await prisma.map.deleteMany();
  await prisma.info.deleteMany();
  await prisma.organizerTask.deleteMany();
  await prisma.organizerActivity.deleteMany();
  await prisma.camperTask.deleteMany();
  await prisma.camperActivity.deleteMany();
  await prisma.camper.deleteMany();
  await prisma.leader.deleteMany();
  await prisma.team.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.role.deleteMany();
  await prisma.bring.deleteMany();
  await prisma.program.deleteMany();

  console.log('✅ Táblák kiürítve.');

  // 2. ROLES
  const [roleFoszerv, roleLogiszt, roleEgeszseg, roleVezeto, roleSzakacs] = await Promise.all([
    prisma.role.create({ data: { name: 'Főszervező' } }),
    prisma.role.create({ data: { name: 'Logisztika' } }),
    prisma.role.create({ data: { name: 'Egészségügyi felelős' } }),
    prisma.role.create({ data: { name: 'Csoportvezető' } }),
    prisma.role.create({ data: { name: 'Szakács' } }),
  ]);

  // 3. CONTACTS
  const [kovacs, nagy, kiss, toth, varga, szabo, horvath, feher] = await Promise.all([
    prisma.contact.create({ data: { name: 'Kovács János', tel: '+36301234567', ordering: 1, roleId: roleFoszerv!.id } }),
    prisma.contact.create({ data: { name: 'Nagy Piroska', tel: '+36302345678', ordering: 2, roleId: roleLogiszt!.id } }),
    prisma.contact.create({ data: { name: 'Kiss Árpád', tel: '+36303456789', ordering: 3, roleId: roleEgeszseg!.id } }),
    prisma.contact.create({ data: { name: 'Tóth Beatrix', tel: '+36304567890', ordering: 4, roleId: roleVezeto!.id } }),
    prisma.contact.create({ data: { name: 'Varga Péter', tel: '+36305678901', ordering: 5, roleId: roleVezeto!.id } }),
    prisma.contact.create({ data: { name: 'Szabó Réka', tel: '+36306789012', ordering: 6, roleId: roleVezeto!.id } }),
    prisma.contact.create({ data: { name: 'Horváth Dávid', tel: '+36307890123', ordering: 7, roleId: roleSzakacs!.id } }),
    prisma.contact.create({ data: { name: 'Fehér Zsófia', tel: '+36308901234', ordering: 8, roleId: roleLogiszt!.id } }),
  ]);

  // 4. TEAMS
  const [pirosTeam, kekTeam, zoldTeam, sargaTeam] = await Promise.all([
    prisma.team.create({ data: { name: 'Piros csapat' } }),
    prisma.team.create({ data: { name: 'Kék csapat' } }),
    prisma.team.create({ data: { name: 'Zöld csapat' } }),
    prisma.team.create({ data: { name: 'Sárga csapat' } }),
  ]);

  // Csoportvezetők hozzárendelése
  await prisma.leader.createMany({
    data: [
      { teamId: pirosTeam!.id, contactId: toth!.id },
      { teamId: kekTeam!.id,   contactId: varga!.id },
      { teamId: zoldTeam!.id,  contactId: szabo!.id },
      { teamId: sargaTeam!.id, contactId: feher!.id },
    ]
  });

  // Táborozók
  await prisma.camper.createMany({
    data: [
      { name: 'Kis Géza',       email: 'geza@test.com',   teamId: pirosTeam!.id },
      { name: 'Nagy Anna',      email: 'anna@test.com',   teamId: pirosTeam!.id },
      { name: 'Molnár Bence',   email: 'bence@test.com',  teamId: pirosTeam!.id },
      { name: 'Varga Béla',     email: 'bela@test.com',   teamId: kekTeam!.id },
      { name: 'Simon Eszter',   email: 'eszter@test.com', teamId: kekTeam!.id },
      { name: 'Farkas Máté',    email: 'mate@test.com',   teamId: kekTeam!.id },
      { name: 'Takács Lilla',   email: 'lilla@test.com',  teamId: zoldTeam!.id },
      { name: 'Papp Dominik',   email: 'domi@test.com',   teamId: zoldTeam!.id },
      { name: 'Oláh Nóra',      email: 'nora@test.com',   teamId: zoldTeam!.id },
      { name: 'Balogh Kristóf', email: 'krisztof@test.com', teamId: sargaTeam!.id },
      { name: 'Fekete Hanna',   email: 'hanna@test.com',  teamId: sargaTeam!.id },
      { name: 'Szőke Ádám',     email: 'adam@test.com',   teamId: sargaTeam!.id },
    ]
  });

  // 5. CAMPER ACTIVITIES & TASKS
  const [aktKonyha, aktKorlet, aktSzemeteles, aktFutes, aktFuvesite] = await Promise.all([
    prisma.camperActivity.create({ data: { title: 'Konyhai ügyelet' } }),
    prisma.camperActivity.create({ data: { title: 'Körletrendezés' } }),
    prisma.camperActivity.create({ data: { title: 'Szemétszedés' } }),
    prisma.camperActivity.create({ data: { title: 'Tűzrakóhely előkészítése' } }),
    prisma.camperActivity.create({ data: { title: 'Fűvesítés és locsolás' } }),
  ]);

  const teams = [pirosTeam!, kekTeam!, zoldTeam!, sargaTeam!];
  const morningActivities = [aktKonyha!, aktKorlet!, aktSzemeteles!, aktFuvesite!];
  const afternoonActivities = [aktKorlet!, aktSzemeteles!, aktFutes!, aktKonyha!];

  // 5 napon keresztül minden csapatnak reggeli és délutáni feladat (rotálva)
  for (let day = 0; day < 5; day++) {
    for (let t = 0; t < teams.length; t++) {
      const morningAct = morningActivities[(day + t) % morningActivities.length]!;
      const afternoonAct = afternoonActivities[(day + t) % afternoonActivities.length]!;

      await prisma.camperTask.create({
        data: {
          day: getCampDate(day),
          timeOffset: timeToSeconds('08:00'),
          camperActivityId: morningAct.id,
          teamId: teams[t]!.id,
        }
      });

      await prisma.camperTask.create({
        data: {
          day: getCampDate(day),
          timeOffset: timeToSeconds('14:00'),
          camperActivityId: afternoonAct.id,
          teamId: teams[t]!.id,
        }
      });
    }
  }

  // 6. ORGANIZER ACTIVITIES & TASKS
  const [orgBeszerzes, orgOrses, orgElsoSeg, orgFozetes, orgHelyszin] = await Promise.all([
    prisma.organizerActivity.create({ data: { title: 'Élelmiszer-beszerzés' } }),
    prisma.organizerActivity.create({ data: { title: 'Éjszakai őrség' } }),
    prisma.organizerActivity.create({ data: { title: 'Elsősegély ügyelet' } }),
    prisma.organizerActivity.create({ data: { title: 'Főzési felügyelet' } }),
    prisma.organizerActivity.create({ data: { title: 'Helyszín ellenőrzés' } }),
  ]);

  const orgTasksData = [
    // 0. nap
    { day: 0, time: '07:30', contactId: kovacs!.id, actId: orgHelyszin!.id },
    { day: 0, time: '12:00', contactId: horvath!.id, actId: orgFozetes!.id },
    { day: 0, time: '23:00', contactId: nagy!.id, actId: orgOrses!.id },
    // 1. nap
    { day: 1, time: '08:00', contactId: feher!.id, actId: orgBeszerzes!.id },
    { day: 1, time: '12:00', contactId: horvath!.id, actId: orgFozetes!.id },
    { day: 1, time: '18:00', contactId: kiss!.id, actId: orgElsoSeg!.id },
    { day: 1, time: '23:00', contactId: varga!.id, actId: orgOrses!.id },
    // 2. nap
    { day: 2, time: '08:00', contactId: nagy!.id, actId: orgBeszerzes!.id },
    { day: 2, time: '12:00', contactId: horvath!.id, actId: orgFozetes!.id },
    { day: 2, time: '23:00', contactId: kovacs!.id, actId: orgOrses!.id },
    // 3. nap
    { day: 3, time: '12:00', contactId: horvath!.id, actId: orgFozetes!.id },
    { day: 3, time: '18:00', contactId: kiss!.id, actId: orgElsoSeg!.id },
    { day: 3, time: '23:00', contactId: szabo!.id, actId: orgOrses!.id },
    // 4. nap
    { day: 4, time: '10:00', contactId: kovacs!.id, actId: orgHelyszin!.id },
    { day: 4, time: '12:00', contactId: horvath!.id, actId: orgFozetes!.id },
    { day: 4, time: '23:00', contactId: toth!.id, actId: orgOrses!.id },
  ];

  for (const t of orgTasksData) {
    await prisma.organizerTask.create({
      data: {
        day: getCampDate(t.day),
        timeOffset: timeToSeconds(t.time),
        organizerActivityId: t.actId,
        contactId: t.contactId,
      }
    });
  }

  // 7. INFO & MEDIA
  const gyikInfo = await prisma.info.create({
    data: {
      title: 'Gyakran Ismételt Kérdések',
      icon: 'HelpCircle',
      content: '',
    }
  });

  const szabalyzatInfo = await prisma.info.create({
    data: {
      title: 'Tábori szabályzat',
      icon: 'FileText',
      content: '<h2>Alapszabályok</h2><p>Kérjük, hogy mindenki tartsa be a közös megállapodásokat. A tábor területét csak engedéllyel lehet elhagyni. Éjjeli csend 22:00-tól reggel 07:00-ig.</p>',
    }
  });

  const helyszinInfo = await prisma.info.create({
    data: {
      title: 'Táborhelyszín és megközelítés',
      icon: 'MapPin',
      content: '<p>A tábor a Pilisi erdők szívében található. A legközelebbi buszmegálló 1,5 km-re van. Parkolás a főbejáratnál lehetséges.</p>',
    }
  });

  await prisma.map.create({
    data: {
      title: 'Táborhelyszín',
      lat: 47.7123,
      lng: 18.9456,
      zoom: 14,
      infoId: helyszinInfo.id,
    }
  });

  const etrendInfo = await prisma.info.create({
    data: {
      title: 'Étkezési rend',
      icon: 'UtensilsCrossed',
      content: '<ul><li><strong>Reggeli:</strong> 08:00</li><li><strong>Ebéd:</strong> 13:00</li><li><strong>Vacsora:</strong> 19:00</li></ul><p>Ételallergiával rendelkező táborozók jelezzék előre!</p>',
    }
  });

  const elsosegInfo = await prisma.info.create({
    data: {
      title: 'Egészségügy és elsősegély',
      icon: 'HeartPulse',
      content: '<p>Az elsősegélyes felszerelés a főépületben, a recepción található. Bármilyen egészségügyi probléma esetén fordulj az egészségügyi felelőshöz.</p>',
    }
  });

  await prisma.media.createMany({
    data: [
      { url: 'https://example.com/gyik.pdf', type: 'FILE', infoId: gyikInfo.id },
      { url: 'https://example.com/hazirend.pdf', type: 'FILE', infoId: szabalyzatInfo.id },
      { url: 'https://example.com/tabor_helyszin.jpg', type: 'IMAGE', infoId: helyszinInfo.id },
      { url: 'https://example.com/elsoSeg_utmutato.pdf', type: 'FILE', infoId: elsosegInfo.id },
    ]
  });

  // 8. BRING
  await prisma.bring.createMany({
    data: [
      { title: 'Hálózsák (-5°C-ig)' },
      { title: 'Személyes tisztasági eszközök' },
      { title: 'Törölköző (2 db)' },
      { title: 'Esőkabát vagy poncsó' },
      { title: 'Kényelmes túrabakancs' },
      { title: 'Váltóruha (5 napra)' },
      { title: 'Napvédő krém (FF30+)' },
      { title: 'Rovarriasztó spray' },
      { title: 'Fejlámpa + tartalék elem' },
      { title: 'Kulacs vagy vizes palack' },
      { title: 'Írószer és füzet' },
      { title: 'Személyi igazolvány / diákigazolvány' },
      { title: 'TAJ-kártya' },
      { title: 'Receptre felírt gyógyszer (ha szükséges)' },
    ]
  });

  // 9. PROGRAMS
  const programok = [
    // 0. nap
    { startOff: '09:00', endOff: '10:00', title: 'Érkezés és bejelentkezés', day: 0 },
    { startOff: '10:30', endOff: '12:00', title: 'Tábormegnyitó és ismerkedés', day: 0 },
    { startOff: '14:00', endOff: '16:00', title: 'Csapatépítő játékok', day: 0 },
    { startOff: '20:00', endOff: '22:00', title: 'Tábortűz és ismerkedési est', day: 0 },
    // 1. nap
    { startOff: '09:00', endOff: '12:00', title: 'Erdei túra – Pilisi kilátó', day: 1 },
    { startOff: '14:00', endOff: '16:00', title: 'Kézműves foglalkozás', day: 1 },
    { startOff: '17:00', endOff: '18:30', title: 'Sportverseny – csapatok között', day: 1 },
    { startOff: '21:00', endOff: '22:00', title: 'Vetélkedő est', day: 1 },
    // 2. nap
    { startOff: '09:30', endOff: '11:30', title: 'Természetismeret workshop', day: 2 },
    { startOff: '14:00', endOff: '17:00', title: 'Vizes játékok a tónál', day: 2 },
    { startOff: '20:00', endOff: '22:00', title: 'Filmvetítés a szabadban', day: 2 },
    // 3. nap
    { startOff: '09:00', endOff: '13:00', title: 'Egész napos kalandpálya', day: 3 },
    { startOff: '15:00', endOff: '17:00', title: 'Tábori olimpia döntők', day: 3 },
    { startOff: '20:00', endOff: '23:00', title: 'Gálavacsora és eredményhirdetés', day: 3 },
    // 4. nap
    { startOff: '09:00', endOff: '10:00', title: 'Csomagolás és pakolás', day: 4 },
    { startOff: '10:30', endOff: '11:30', title: 'Záróünnepség és oklevelek', day: 4 },
    { startOff: '12:00', endOff: '13:00', title: 'Hazautazás', day: 4 },
  ];

  for (const p of programok) {
    await prisma.program.create({
      data: {
        startDay: getCampDate(p.day),
        endDay: getCampDate(p.day),
        startTimeOffset: timeToSeconds(p.startOff),
        endTimeOffset: timeToSeconds(p.endOff),
        title: p.title,
        desc: p.title.includes('túra') || p.title.includes('kalandpálya')
          ? `<p>Ez a program az egész csapatnak kötelező. Megfelelő cipőt és vizes palackot hozzatok!</p>`
          : null,
      }
    });
  }

  // 10. SETTINGS
  await prisma.setting.createMany({
    data: [
      { str_id: 'camp_start_date',    label: 'Tábor kezdete',           value: '2026-07-14',                        comment: 'ÉÉÉÉ-HH-NN formátumban' },
      { str_id: 'camp_end_date',      label: 'Tábor vége',              value: '2026-07-19',                        comment: 'ÉÉÉÉ-HH-NN formátumban' },
      { str_id: 'camp_location',      label: 'Táborhely neve',          value: 'Pilisi Erdei Tábor',                comment: '' },
      { str_id: 'facebook_event_url', label: 'Facebook esemény linkje', value: '',                                  comment: 'Teljes URL, pl. https://facebook.com/events/...' },
      { str_id: 'group_sheet_url',    label: 'Csoportbeosztás linkje',  value: '',                                  comment: 'Teljes URL a csoportbeosztás oldalához' },
      { str_id: 'gyik_url',           label: 'GYIK oldal linkje',       value: `/kozitabor/info/${gyikInfo.id}`,    comment: 'Az Info bejegyzés relatív útvonala' },
      { str_id: 'app_status',         label: 'Alkalmazás állapota',     value: 'active',                            comment: '"active" vagy "inactive"' },
      { str_id: 'registrant_count',   label: 'Jelentkezők száma',       value: '0',                                 comment: 'A táborba jelentkezett táborozók száma' },
    ]
  });

  // 11. DEADLINES (mai dátum és tábor kezdete között)
  await prisma.deadline.createMany({
    data: [
      { label: 'Előzetes regisztráció lezárása', date: getFixedDate(2026, 5, 10) },
      { label: 'Díjbefizetési határidő',          date: getFixedDate(2026, 5, 31) },
      { label: 'Orvosi igazolás beadása',         date: getFixedDate(2026, 6, 14) },
      { label: 'Felszerelési lista véglegesítése',date: getFixedDate(2026, 6, 28) },
      { label: 'Indulás előtti tájékoztató',      date: getFixedDate(2026, 7, 5) },
    ]
  });

  console.log('✨ Seeder sikeresen lefutott.');
}

main()
  .catch((e) => {
    console.error('❌ Hiba:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
