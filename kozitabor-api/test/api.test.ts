// Must be set before importing app so rate limiters are bypassed
process.env.NODE_ENV = 'test';

import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

// ─── ANSI ────────────────────────────────────────────────────────────────────
const G = '\x1b[32m';   // green
const R = '\x1b[31m';   // red
const C = '\x1b[36m';   // cyan
const B = '\x1b[1m';    // bold
const D = '\x1b[2m';    // dim
const X = '\x1b[0m';    // reset

// ─── Runner ───────────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;
const failures: { name: string; error: string }[] = [];
let currentSection = '';

function section(name: string): void {
  currentSection = name;
  console.log(`\n  ${B}${C}${name}${X}`);
}

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  const t = Date.now();
  try {
    await fn();
    passed++;
    console.log(`    ${G}✓${X} ${name} ${D}(${Date.now() - t}ms)${X}`);
  } catch (err: any) {
    failed++;
    const msg: string = err?.message ?? String(err);
    failures.push({ name: `${currentSection} › ${name}`, error: msg });
    console.log(`    ${R}✗${X} ${name}`);
    console.log(`      ${D}${msg}${X}`);
  }
}

function ok(condition: boolean, msg: string): void {
  if (!condition) throw new Error(msg);
}

function status(res: any, expected: number): void {
  if (res.status !== expected) {
    throw new Error(`HTTP ${expected} expected, got ${res.status} — body: ${JSON.stringify(res.body)}`);
  }
}

// ─── State ────────────────────────────────────────────────────────────────────
const ts = Date.now();
const ctx: Record<string, any> = {
  token: '',
  testUserEmail: `_test_${ts}@kozitabor-test.hu`,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const api = request(app);

const auth = (method: 'get' | 'post' | 'put' | 'delete', path: string) =>
  api[method](path).set('Authorization', `Bearer ${ctx.token}`);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const run = async () => {
  const startAll = Date.now();
  console.clear();
  console.log('\n' + '═'.repeat(64));
  console.log(`  ${B}KOZITABOR API – INTEGRÁCIÓS TESZTEK${X}`);
  console.log('═'.repeat(64));

  // ── Felállítás ──────────────────────────────────────────────────────────────
  section('Felállítás');

  await test('Teszt felhasználó létrehozása', async () => {
    const hash = await bcrypt.hash('TestPass_1234!', 10);
    const user = await prisma.user.create({
      data: { email: ctx.testUserEmail, name: 'API Test User', password: hash },
    });
    ctx.testUserId = user.id;
  });

  // ── Auth ────────────────────────────────────────────────────────────────────
  section('Hitelesítés (Auth)');

  await test('Bejelentkezés helyes adatokkal → 200 + token', async () => {
    const res = await api.post('/api/auth/login').send({ email: ctx.testUserEmail, password: 'TestPass_1234!' });
    status(res, 200);
    ok(typeof res.body.token === 'string', 'token hiányzik a válaszból');
    ok(typeof res.body.user?.email === 'string', 'user hiányzik a válaszból');
    ctx.token = res.body.token;
  });

  await test('Bejelentkezés rossz jelszóval → 401', async () => {
    const res = await api.post('/api/auth/login').send({ email: ctx.testUserEmail, password: 'wrong' });
    status(res, 401);
  });

  await test('Bejelentkezés érvénytelen email formátummal → 400', async () => {
    const res = await api.post('/api/auth/login').send({ email: 'nem-email', password: 'pass' });
    status(res, 400);
    ok(Array.isArray(res.body.details), 'validációs részletek hiányoznak');
  });

  await test('Bejelentkezés hiányzó mezőkkel → 400', async () => {
    const res = await api.post('/api/auth/login').send({});
    status(res, 400);
  });

  await test('Session lekérdezése érvényes tokennel → 200', async () => {
    const res = await auth('get', '/api/auth/session');
    status(res, 200);
    ok(res.body.user?.email === ctx.testUserEmail, 'rossz felhasználó a session-ben');
  });

  await test('Session lekérdezése token nélkül → 401', async () => {
    const res = await api.get('/api/auth/session');
    status(res, 401);
  });

  await test('Kijelentkezés → 200', async () => {
    const res = await api.post('/api/auth/logout');
    status(res, 200);
    ok(res.body.success === true, 'success hiányzik');
  });

  // ── Core publikus végpontok ──────────────────────────────────────────────────
  section('Publikus végpontok (Core)');

  for (const path of ['/contact', '/bring', '/team', '/setting', '/deadline', '/program']) {
    await test(`GET /api${path} → 200, tömb`, async () => {
      const res = await api.get(`/api${path}`);
      status(res, 200);
      ok(Array.isArray(res.body), 'a válasz nem tömb');
    });
  }

  await test('GET /api/liveProgram → 200, current+next mezők', async () => {
    const res = await api.get('/api/liveProgram');
    status(res, 200);
    ok('current' in res.body && 'next' in res.body, 'hiányzó current vagy next mező');
  });

  // ── Admin végpontok védelme ──────────────────────────────────────────────────
  section('Admin végpontok védelme');

  await test('Kérés token nélkül → 401', async () => {
    const res = await api.get('/api/admin/contact');
    status(res, 401);
  });

  await test('Kérés érvénytelen tokennel → 401', async () => {
    const res = await api.get('/api/admin/contact').set('Authorization', 'Bearer invalid.token.here');
    status(res, 401);
  });

  // ── Admin: Role ─────────────────────────────────────────────────────────────
  section('Admin: Szerepkör (Role)');

  await test('Létrehozás → 201', async () => {
    const res = await auth('post', '/api/admin/role').send({ name: `_TEST_ROLE_${ts}` });
    status(res, 201);
    ok(res.body.id > 0, 'nincs id a válaszban');
    ctx.roleId = res.body.id;
  });

  await test('Lista → 200, tömb, tartalmazza az újat', async () => {
    const res = await auth('get', '/api/admin/role');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
    ok(res.body.some((r: any) => r.id === ctx.roleId), 'létrehozott elem nem szerepel');
  });

  // ── Admin: Contact ──────────────────────────────────────────────────────────
  section('Admin: Kapcsolattartó (Contact)');

  await test('Létrehozás → 201', async () => {
    const res = await auth('post', '/api/admin/contact').send({ name: `_TEST_CONTACT_${ts}`, tel: '06301234567', roleId: ctx.roleId });
    status(res, 201);
    ok(res.body.id > 0, 'nincs id');
    ctx.contactId = res.body.id;
  });

  await test('Lista → 200, role relációval', async () => {
    const res = await auth('get', '/api/admin/contact');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
    const found = res.body.find((c: any) => c.id === ctx.contactId);
    ok(found !== undefined, 'létrehozott elem nem szerepel');
    ok('role' in found, 'role reláció hiányzik');
  });

  await test('Egy elem → 200', async () => {
    const res = await auth('get', `/api/admin/contact/${ctx.contactId}`);
    status(res, 200);
    ok(res.body.id === ctx.contactId, 'rossz id');
  });

  await test('Frissítés → 200', async () => {
    const res = await auth('put', `/api/admin/contact/${ctx.contactId}`).send({ name: `_TEST_CONTACT_UPD_${ts}` });
    status(res, 200);
    ok(res.body.name.includes('UPD'), 'nem frissült');
  });

  await test('Tömeges létrehozás (bulk) → 201', async () => {
    const res = await auth('post', '/api/admin/contact/bulk').send([
      { name: `_BULK_A_${ts}` },
      { name: `_BULK_B_${ts}`, tel: '06209999999' },
    ]);
    status(res, 201);
    ok(res.body.count === 2, `Várt 2 elemet, kapott: ${res.body.count}`);
  });

  // ── Admin: Bring ─────────────────────────────────────────────────────────────
  section('Admin: Hozz magaddal (Bring)');

  await test('Létrehozás → 201', async () => {
    const res = await auth('post', '/api/admin/bring').send({ title: `_TEST_BRING_${ts}` });
    status(res, 201);
    ok(res.body.id > 0, 'nincs id');
    ctx.bringId = res.body.id;
  });

  await test('Lista → 200', async () => {
    const res = await auth('get', '/api/admin/bring');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
  });

  await test('Frissítés → 200', async () => {
    const res = await auth('put', `/api/admin/bring/${ctx.bringId}`).send({ title: `_TEST_BRING_UPD_${ts}` });
    status(res, 200);
    ok(res.body.title.includes('UPD'), 'nem frissült');
  });

  // ── Admin: Team ─────────────────────────────────────────────────────────────
  section('Admin: Csapat (Team)');

  await test('Létrehozás → 201', async () => {
    const res = await auth('post', '/api/admin/team').send({ name: `_TEST_TEAM_${ts}`, leaderIds: [] });
    status(res, 201);
    ok(res.body.id > 0, 'nincs id');
    ctx.teamId = res.body.id;
  });

  await test('Lista → 200, leaders tömbbel', async () => {
    const res = await auth('get', '/api/admin/team');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
    const found = res.body.find((t: any) => t.id === ctx.teamId);
    ok(found !== undefined, 'létrehozott elem nem szerepel');
    ok(Array.isArray(found.leaders), 'leaders tömb hiányzik');
  });

  await test('Egy elem → 200', async () => {
    const res = await auth('get', `/api/admin/team/${ctx.teamId}`);
    status(res, 200);
    ok(res.body.id === ctx.teamId, 'rossz id');
  });

  await test('Frissítés (vezető hozzárendelésével) → 200', async () => {
    const res = await auth('put', `/api/admin/team/${ctx.teamId}`).send({
      name: `_TEST_TEAM_UPD_${ts}`,
      leaderIds: [ctx.contactId],
    });
    status(res, 200);
    ok(res.body.name.includes('UPD'), 'nem frissült a név');
    ok(res.body.leaders?.length === 1, 'vezető nem lett hozzárendelve');
  });

  // ── Admin: CamperActivity ────────────────────────────────────────────────────
  section('Admin: Tábori tevékenység (CamperActivity)');

  await test('Létrehozás → 201', async () => {
    const res = await auth('post', '/api/admin/camper-activity').send({ title: `_TEST_CA_${ts}` });
    status(res, 201);
    ok(res.body.id > 0, 'nincs id');
    ctx.camperActivityId = res.body.id;
  });

  await test('Lista → 200', async () => {
    const res = await auth('get', '/api/admin/camper-activity');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
  });

  await test('Egy elem → 200', async () => {
    const res = await auth('get', `/api/admin/camper-activity/${ctx.camperActivityId}`);
    status(res, 200);
    ok(res.body.id === ctx.camperActivityId, 'rossz id');
  });

  await test('Frissítés → 200', async () => {
    const res = await auth('put', `/api/admin/camper-activity/${ctx.camperActivityId}`).send({ title: `_TEST_CA_UPD_${ts}` });
    status(res, 200);
    ok(res.body.title.includes('UPD'), 'nem frissült');
  });

  // ── Admin: OrganizerActivity ─────────────────────────────────────────────────
  section('Admin: Szervezői tevékenység (OrganizerActivity)');

  await test('Létrehozás → 201', async () => {
    const res = await auth('post', '/api/admin/organizer-activity').send({ title: `_TEST_OA_${ts}` });
    status(res, 201);
    ok(res.body.id > 0, 'nincs id');
    ctx.organizerActivityId = res.body.id;
  });

  await test('Lista → 200', async () => {
    const res = await auth('get', '/api/admin/organizer-activity');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
  });

  await test('Egy elem → 200', async () => {
    const res = await auth('get', `/api/admin/organizer-activity/${ctx.organizerActivityId}`);
    status(res, 200);
    ok(res.body.id === ctx.organizerActivityId, 'rossz id');
  });

  await test('Frissítés → 200', async () => {
    const res = await auth('put', `/api/admin/organizer-activity/${ctx.organizerActivityId}`).send({ title: `_TEST_OA_UPD_${ts}` });
    status(res, 200);
    ok(res.body.title.includes('UPD'), 'nem frissült');
  });

  // ── Admin: Setting ───────────────────────────────────────────────────────────
  section('Admin: Beállítás (Setting)');

  await test('Létrehozás → 201, str_id generálódik', async () => {
    const res = await auth('post', '/api/admin/setting').send({ label: `Test Setting ${ts}`, value: 'test_val' });
    status(res, 201);
    ok(res.body.id > 0, 'nincs id');
    ok(typeof res.body.str_id === 'string' && /^[a-z0-9_]+$/.test(res.body.str_id), `str_id nem valid slug: '${res.body.str_id}'`);
    ctx.settingId = res.body.id;
  });

  await test('Lista → 200', async () => {
    const res = await auth('get', '/api/admin/setting');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
  });

  await test('Egy elem → 200', async () => {
    const res = await auth('get', `/api/admin/setting/${ctx.settingId}`);
    status(res, 200);
    ok(res.body.id === ctx.settingId, 'rossz id');
  });

  await test('Frissítés (value) → 200', async () => {
    const res = await auth('put', `/api/admin/setting/${ctx.settingId}`).send({ label: `Test Setting ${ts}`, value: 'updated_val' });
    status(res, 200);
    ok(res.body.value === 'updated_val', 'value nem frissült');
  });

  // ── Admin: Deadline ──────────────────────────────────────────────────────────
  section('Admin: Határidő (Deadline)');

  await test('Létrehozás → 201', async () => {
    const res = await auth('post', '/api/admin/deadline').send({ label: `_TEST_DL_${ts}`, date: '2025-07-01' });
    status(res, 201);
    ok(res.body.id > 0, 'nincs id');
    ctx.deadlineId = res.body.id;
  });

  await test('Lista → 200', async () => {
    const res = await auth('get', '/api/admin/deadline');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
  });

  await test('Egy elem → 200', async () => {
    const res = await auth('get', `/api/admin/deadline/${ctx.deadlineId}`);
    status(res, 200);
    ok(res.body.id === ctx.deadlineId, 'rossz id');
  });

  await test('Frissítés → 200', async () => {
    const res = await auth('put', `/api/admin/deadline/${ctx.deadlineId}`).send({ label: `_TEST_DL_UPD_${ts}`, date: '2025-07-15' });
    status(res, 200);
    ok(res.body.label.includes('UPD'), 'nem frissült');
  });

  // ── Admin: Program ───────────────────────────────────────────────────────────
  section('Admin: Program');

  await test('Létrehozás → 201', async () => {
    const res = await auth('post', '/api/admin/program').send({
      title: `_TEST_PROG_${ts}`,
      startDay: '2025-07-14',
      startTimeOffset: 60,
      endDay: '2025-07-14',
      endTimeOffset: 120,
    });
    status(res, 201);
    ok(res.body.id > 0, 'nincs id');
    ctx.programId = res.body.id;
  });

  await test('Lista → 200', async () => {
    const res = await auth('get', '/api/admin/program');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
  });

  await test('Egy elem → 200', async () => {
    const res = await auth('get', `/api/admin/program/${ctx.programId}`);
    status(res, 200);
    ok(res.body.id === ctx.programId, 'rossz id');
  });

  await test('Frissítés → 200', async () => {
    const res = await auth('put', `/api/admin/program/${ctx.programId}`).send({
      title: `_TEST_PROG_UPD_${ts}`,
      startDay: '2025-07-14',
      startTimeOffset: 60,
      endDay: '2025-07-14',
      endTimeOffset: 180,
    });
    status(res, 200);
    ok(res.body.title.includes('UPD'), 'nem frissült');
    ok(res.body.endTimeOffset === 180, 'endTimeOffset nem frissült');
  });

  // ── Admin: Camper ────────────────────────────────────────────────────────────
  section('Admin: Tábori résztvevő (Camper)');

  await test('Létrehozás → 201 (teamId szükséges)', async () => {
    const res = await auth('post', '/api/admin/camper').send({ name: `_TEST_CAMPER_${ts}`, teamId: ctx.teamId });
    status(res, 201);
    ok(res.body.id > 0, 'nincs id');
    ctx.camperId = res.body.id;
  });

  await test('Lista → 200, team relációval', async () => {
    const res = await auth('get', '/api/admin/camper');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
    const found = res.body.find((c: any) => c.id === ctx.camperId);
    ok(found !== undefined, 'létrehozott elem nem szerepel');
    ok('team' in found, 'team reláció hiányzik');
  });

  await test('Frissítés → 200', async () => {
    const res = await auth('put', `/api/admin/camper/${ctx.camperId}`).send({ name: `_TEST_CAMPER_UPD_${ts}`, teamId: ctx.teamId });
    status(res, 200);
    ok(res.body.name.includes('UPD'), 'nem frissült');
  });

  // ── Admin: CamperTask ────────────────────────────────────────────────────────
  section('Admin: Tábori beosztás (CamperTask)');

  await test('Létrehozás → 201, tömb', async () => {
    const res = await auth('post', '/api/admin/camper-task').send({
      day: '2025-07-14',
      timeOffset: 60,
      teamIds: [ctx.teamId],
      activityIds: [ctx.camperActivityId],
    });
    status(res, 201);
    ok(Array.isArray(res.body) && res.body.length >= 1, 'nem tömb vagy üres');
    ctx.camperTaskId = res.body[0].id;
  });

  await test('Lista → 200, team és activity relációval', async () => {
    const res = await auth('get', '/api/admin/camper-task');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
    const found = res.body.find((t: any) => t.id === ctx.camperTaskId);
    ok(found !== undefined, 'létrehozott elem nem szerepel');
    ok('team' in found && 'camperActivity' in found, 'reláció hiányzik');
  });

  await test('Duplikált létrehozás kihagyva (idempotens)', async () => {
    const res = await auth('post', '/api/admin/camper-task').send({
      day: '2025-07-14',
      timeOffset: 60,
      teamIds: [ctx.teamId],
      activityIds: [ctx.camperActivityId],
    });
    status(res, 201);
    ok(res.body.length === 0, `Duplikált elem nem lett kihagyva, kapott: ${res.body.length}`);
  });

  // ── Admin: OrganizerTask ─────────────────────────────────────────────────────
  section('Admin: Szervezői beosztás (OrganizerTask)');

  await test('Létrehozás → 201, tömb', async () => {
    const res = await auth('post', '/api/admin/organizer-task').send({
      day: '2025-07-14',
      timeOffset: 60,
      contactIds: [ctx.contactId],
      activityIds: [ctx.organizerActivityId],
    });
    status(res, 201);
    ok(Array.isArray(res.body) && res.body.length >= 1, 'nem tömb vagy üres');
    ctx.organizerTaskId = res.body[0].id;
  });

  await test('Lista → 200, contact és activity relációval', async () => {
    const res = await auth('get', '/api/admin/organizer-task');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
    const found = res.body.find((t: any) => t.id === ctx.organizerTaskId);
    ok(found !== undefined, 'létrehozott elem nem szerepel');
    ok('contact' in found && 'organizerActivity' in found, 'reláció hiányzik');
  });

  // ── Admin: Info (csak GET – POST/PUT multipart) ──────────────────────────────
  section('Admin: Információs kártya (Info)');

  await test('Lista → 200', async () => {
    const res = await auth('get', '/api/admin/info');
    status(res, 200);
    ok(Array.isArray(res.body), 'nem tömb');
  });

  // ── Validáció ────────────────────────────────────────────────────────────────
  section('Validáció (hibás kérések)');

  await test('Team – hiányzó name → 400 + details tömb', async () => {
    const res = await auth('post', '/api/admin/team').send({ leaderIds: [] });
    status(res, 400);
    ok(Array.isArray(res.body.details), 'details tömb hiányzik');
  });

  await test('Deadline – érvénytelen dátum → 400', async () => {
    const res = await auth('post', '/api/admin/deadline').send({ label: 'x', date: 'nem-datum' });
    status(res, 400);
  });

  await test('Setting – üres label → 400', async () => {
    const res = await auth('post', '/api/admin/setting').send({ label: '', value: 'v' });
    status(res, 400);
  });

  await test('CamperTask – üres activityIds → 400', async () => {
    const res = await auth('post', '/api/admin/camper-task').send({
      day: '2025-07-14', timeOffset: 0, teamIds: [1], activityIds: [],
    });
    status(res, 400);
  });

  await test('Program – hiányzó title → 400', async () => {
    const res = await auth('post', '/api/admin/program').send({
      startDay: '2025-07-14', startTimeOffset: 0, endDay: '2025-07-14', endTimeOffset: 60,
    });
    status(res, 400);
  });

  await test('Nem létező elem lekérdezése → 404', async () => {
    const res = await auth('get', '/api/admin/bring/99999999');
    status(res, 404);
  });

  await test('Érvénytelen ID formátum → 400', async () => {
    const res = await auth('get', '/api/admin/contact/nem-szam');
    status(res, 400);
  });

  // ── Törlések (fordított függőségi sorrendben) ────────────────────────────────
  section('Törlések és takarítás');

  await test('CamperTask törlése → 200', async () => {
    ok(!!ctx.camperTaskId, 'camperTaskId hiányzik – előző lépés sikertelen volt');
    const res = await auth('delete', `/api/admin/camper-task/${ctx.camperTaskId}`);
    status(res, 200);
  });

  await test('OrganizerTask törlése → 200', async () => {
    ok(!!ctx.organizerTaskId, 'organizerTaskId hiányzik – előző lépés sikertelen volt');
    const res = await auth('delete', `/api/admin/organizer-task/${ctx.organizerTaskId}`);
    status(res, 200);
  });

  await test('Camper törlése → 200', async () => {
    ok(!!ctx.camperId, 'camperId hiányzik');
    const res = await auth('delete', `/api/admin/camper/${ctx.camperId}`);
    status(res, 200);
  });

  await test('Team törlése → 200 (Leader cascade-del)', async () => {
    ok(!!ctx.teamId, 'teamId hiányzik');
    const res = await auth('delete', `/api/admin/team/${ctx.teamId}`);
    status(res, 200);
  });

  await test('Contact törlése → 200', async () => {
    ok(!!ctx.contactId, 'contactId hiányzik');
    const res = await auth('delete', `/api/admin/contact/${ctx.contactId}`);
    status(res, 200);
  });

  await test('Bulk kontaktok törlése', async () => {
    const count = await prisma.contact.deleteMany({
      where: { name: { in: [`_BULK_A_${ts}`, `_BULK_B_${ts}`] } },
    });
    ok(count.count === 2, `2 elemet vártam, törölt: ${count.count}`);
  });

  await test('Role törlése → 200', async () => {
    ok(!!ctx.roleId, 'roleId hiányzik');
    const res = await auth('delete', `/api/admin/role/${ctx.roleId}`);
    status(res, 200);
  });

  await test('CamperActivity törlése → 200', async () => {
    ok(!!ctx.camperActivityId, 'camperActivityId hiányzik');
    const res = await auth('delete', `/api/admin/camper-activity/${ctx.camperActivityId}`);
    status(res, 200);
  });

  await test('OrganizerActivity törlése → 200', async () => {
    ok(!!ctx.organizerActivityId, 'organizerActivityId hiányzik');
    const res = await auth('delete', `/api/admin/organizer-activity/${ctx.organizerActivityId}`);
    status(res, 200);
  });

  await test('Bring törlése → 200', async () => {
    ok(!!ctx.bringId, 'bringId hiányzik');
    const res = await auth('delete', `/api/admin/bring/${ctx.bringId}`);
    status(res, 200);
  });

  await test('Setting törlése → 200', async () => {
    ok(!!ctx.settingId, 'settingId hiányzik');
    const res = await auth('delete', `/api/admin/setting/${ctx.settingId}`);
    status(res, 200);
  });

  await test('Deadline törlése → 200', async () => {
    ok(!!ctx.deadlineId, 'deadlineId hiányzik');
    const res = await auth('delete', `/api/admin/deadline/${ctx.deadlineId}`);
    status(res, 200);
  });

  await test('Program törlése → 200', async () => {
    ok(!!ctx.programId, 'programId hiányzik');
    const res = await auth('delete', `/api/admin/program/${ctx.programId}`);
    status(res, 200);
  });

  await test('Teszt felhasználó törlése', async () => {
    await prisma.user.delete({ where: { email: ctx.testUserEmail } });
  });

  // ── Összegzés ────────────────────────────────────────────────────────────────
  const totalMs = Date.now() - startAll;
  const total = passed + failed;

  console.log('\n' + '═'.repeat(64));
  if (failed === 0) {
    console.log(`  ${B}${G}✓ Minden teszt sikeres: ${total}/${total}${X}   ${D}(${totalMs}ms)${X}`);
  } else {
    console.log(`  ${B}${R}✗ Hibák: ${failed}/${total}${X}   ${D}(${totalMs}ms)${X}`);
    console.log(`\n  ${B}Sikertelen tesztek:${X}`);
    failures.forEach(f => {
      console.log(`    ${R}›${X} ${B}${f.name}${X}`);
      console.log(`      ${D}${f.error}${X}`);
    });
  }
  console.log('═'.repeat(64) + '\n');

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
};

run().catch(async err => {
  console.error('\n❌ Kritikus teszt hiba:', err);
  await prisma.$disconnect();
  process.exit(1);
});
