# Kozitábor — Full-Stack Camp Management Application

A web application for managing a summer camp. It has two distinct faces:

- **Participant app** — a mobile-first public interface where campers can browse the schedule, info cards, contact list, task assignments, deadlines, and packing list.
- **Admin panel** — a password-protected management interface for organizers to manage all content and monitor the camp in real time.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Backend** | Node.js, Express 5, Prisma 7, PostgreSQL 15 |
| **Auth** | JWT (jsonwebtoken + bcrypt) |
| **File uploads** | Multer (images & documents stored locally) |
| **Frontend** | React 19, Vite 8, TypeScript, TailwindCSS 3 |
| **Routing** | React Router 7 |
| **Drag & Drop** | @hello-pangea/dnd |
| **Excel import** | SheetJS (xlsx) |
| **Charts** | Tremor |
| **Deployment** | Docker, Docker Compose, nginx |

---

## Features

### Participant App (`/`)

- **Home page** — entry point with navigation to all sections
- **Schedule** (`/program`) — daily program breakdown with time offsets; detail view per item; live "current / next" program via `/api/liveProgram`
- **Info cards** (`/info`) — richly formatted information cards with optional map and media attachments
- **Teams** (`/team`) — team list with assigned leaders
- **Contacts** (`/contacts`) — contact directory with roles and phone numbers
- **Packing list** (`/whattobring`) — items to bring; checkbox state persisted in `localStorage`
- **Camper tasks** (`/tasks`) — task assignments per team, day, and time slot
- **Deadlines** (`/deadlines`) — upcoming camp deadlines
- **FAQ** (`/gyik`) — frequently asked questions

### Admin Panel (`/admin`)

Fully protected — requires JWT authentication via `/auth/login`.

- **Dashboard** — live stats (teams, contacts, programs, info cards), upcoming programs, upcoming deadlines, upcoming organizer tasks; app status toggle
- **Programs** — CRUD for daily schedule items with day + time offset
- **Teams** — CRUD with leader assignment (multiple contacts per team)
- **Contacts** — CRUD with drag & drop reordering, role assignment, Excel bulk import (auto-detects name and phone columns in Hungarian and English)
- **Roles** — simple role taxonomy for contacts
- **Info cards** — CRUD with rich content, optional embedded map (lat/lng/zoom), and file/image upload
- **Camper activities** — activity type definitions for the camper task system
- **Camper tasks** — bulk assignment of activities to teams at specific times; duplicate assignments are silently skipped (idempotent)
- **Organizer activities** — activity type definitions for the organizer schedule
- **Organizer tasks** — scheduling contacts to activities at specific times
- **Packing list items** — manage the list of items participants should bring
- **Settings** — key-value store for app-wide configuration (e.g. `app_status`, dates, URLs); `str_id` is a stable slug auto-generated from the label
- **Deadlines** — manage important deadlines shown to participants

---

## Data Model

```
User              — Admin accounts (email + bcrypt password, JWT auth)
Contact           — Organizers/leaders; ordered list, optional role and phone
Role              — Role taxonomy for contacts (e.g. "Csapatvezető")
Team              — Camp teams; connected to leaders (Contact) via Leader join table
Camper            — Team members (name, optional email)
Leader            — Join table: Team ↔ Contact
CamperActivity    — Activity type for camper tasks (e.g. "Főzés")
CamperTask        — Team assigned to a CamperActivity at a specific day + timeOffset
OrganizerActivity — Activity type for organizer schedule
OrganizerTask     — Contact assigned to OrganizerActivity at a specific day + timeOffset
Program           — Schedule item with startDay/endDay and time offsets
Info              — Information card with optional Map and Media children
Map               — Google-Maps-compatible lat/lng/zoom for an Info card
Media             — File or image attachment for an Info card
Bring             — Packing list item
Deadline          — Named deadline with a UTC-normalized date
Setting           — Key-value config row; str_id is a stable slug derived from label; comment is an optional internal note
```

`timeOffset` throughout the codebase is an integer representing **seconds** from midnight (e.g. `28800` = 08:00).

---

## Project Structure

```
full-stack/
├── kozitabor-api/          # Express + Prisma backend
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── app.ts          # Express app factory (imported by index.ts and tests)
│   │   ├── index.ts        # Server entry point (listen + graceful shutdown)
│   │   ├── controllers/    # Custom business logic handlers
│   │   ├── middleware/     # auth, param parsing, rate limiting, file upload, validation
│   │   ├── routes/         # admin.ts, core.ts, auth.ts
│   │   ├── schemas/        # Zod validation schemas for admin routes
│   │   ├── services/       # Generic CRUD service factory + entity services
│   │   ├── seeder/         # seed.ts (data), users.ts (admin accounts)
│   │   └── utils/          # controllerFactory, logger, parser
│   ├── test/
│   │   └── api.test.ts     # Integration test suite (~80 tests, custom runner)
│   └── uploads/            # Uploaded files (not committed)
│
├── kozitabor-react/        # React + Vite frontend
│   └── src/
│       ├── components/     # Shared UI components (admin + core)
│       ├── context/        # React contexts: auth, DB cache (admin + core), toast, theme
│       ├── features/       # Composite UI blocks (ProgramBlock, ContactBlock, …)
│       ├── layouts/        # AdminLayout, CoreLayout
│       ├── pages/
│       │   ├── admin/      # All admin CRUD pages + DashboardPage
│       │   └── core/       # All participant-facing pages
│       ├── types/          # Shared TypeScript types (database.ts, forms.ts)
│       └── utils/          # API client, date helpers
│
├── build/                  # Temporary build artifacts (generated by DevTool)
├── development-db/         # Docker Compose file + local PostgreSQL data volume
├── docker-compose.yml      # Local dev orchestration reference
├── docker-compose-deploy.yml # Production deploy orchestration
├── nginx.conf              # Reverse proxy config (serves React, proxies API)
└── devtool.mjs             # Interactive CLI for dev, build, test, and deploy tasks
```

---

## Local Development Setup

### Prerequisites

- **Node.js** v18 or newer
- **Docker & Docker Compose** (for the local PostgreSQL database)

### Quick start via DevTool

The recommended workflow uses `devtool.mjs`, which handles database startup, dependency installation, migrations, and seeding automatically.

```bash
# 1. Install dependencies and run initial DB migrations
#    If no root .env file exists, init will copy .env.sample and
#    interactively prompt for each variable value.
node devtool.mjs init

# 2. Seed the database with content and admin users
node devtool.mjs seed

# 3. Start all services (DB + API + React)
node devtool.mjs run
```

The participant app is available at `http://localhost:5173/kozitabor/`  
The admin panel is at `http://localhost:5173/kozitabor/admin`

### Manual setup

If you prefer not to use the DevTool:

```bash
# Install dependencies
cd kozitabor-api && npm install
cd ../kozitabor-react && npm install

# Start the local PostgreSQL container
docker compose -f development-db/docker-compose.yml up -d

# Run migrations (in kozitabor-api/)
npx dotenv -e .env.development npx prisma migrate dev

# Seed data and admin user
npm run seed
npm run seedUser

# Start API (kozitabor-api/)
npm run dev

# Start React (kozitabor-react/)
npm run dev
```

### Environment variables

The API and the frontend each have a `.env.development` file committed with pre-filled local defaults — no changes are needed for a standard local setup.

| File | Key variables |
|---|---|
| `kozitabor-api/.env.development` | `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `API_PORT`, `CLIENT_URL`, `CLIENT_PORT`, `IS_DEV` |
| `kozitabor-react/.env.development` | `VITE_API_BASE_URL` |

For **production**, a root-level `.env` file is required (not committed). A `.env.sample` template is provided — `node devtool.mjs init` generates `.env` from it interactively if the file is missing.

| Variable | Description |
|---|---|
| `DB_NAME`, `DB_USER`, `DB_PASS` | PostgreSQL credentials used by Docker Compose |
| `JWT_SECRET` | Random string (min. 64 chars) for signing tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default: `1h`) |
| `CLIENT_URL`, `CLIENT_PORT`, `API_PORT` | Service URLs and ports |
| `VITE_API_BASE_URL` | Relative API path baked into the React build (e.g. `/kozitabor/api`) |

---

## Admin Authentication

The admin panel is protected by JWT. Use the credentials created by `npm run seedUser` (or `node devtool.mjs seed user`). Tokens expire after the duration configured in `JWT_EXPIRES_IN` (default: `1h`).

---

## Testing

The API has a full integration test suite that runs against a live database.

```bash
# Run all tests (starts DB, runs tests, stops DB)
node devtool.mjs test

# Or directly inside kozitabor-api/
npm test
```

The test runner is custom-built (no Jest/Vitest) with ANSI-colored output. It covers ~80 test cases across all endpoints: auth, all public Core routes, all Admin CRUD routes, validation errors, and cleanup. Rate limiting is bypassed in the test environment via `NODE_ENV=test`.

---

## DevTool — Automation CLI

`devtool.mjs` is an ES module CLI for all common development and deployment tasks. Run it without arguments to see the full command menu:

```bash
node devtool.mjs
```

### Available commands

| Command | Description |
|---|---|
| `init` | Create `.env` from `.env.sample` (if missing, prompts for values), install npm dependencies, run DB migrations |
| `run` | Start all services: DB (Docker), API, React (both in background) |
| `run db` | Start only the PostgreSQL Docker container |
| `run api` | Start only the backend API in the background |
| `run react` | Start only the React frontend in the background |
| `stop` | Stop all running services |
| `stop db` | Stop only the database container |
| `stop api` | Free the API port (kill process on port 5000) |
| `stop react` | Free the React port (kill process on port 5173) |
| `seed` | Start DB, seed all data + admin users, stop DB |
| `seed data` | Start DB, seed content tables only, stop DB |
| `seed user` | Start DB, seed admin user accounts only, stop DB |
| `test` | Start DB, run the full API integration test suite, stop DB |
| `build` | Prompt for target platform (default: `linux/amd64`), build Docker images, export as `.tar.gz` |
| `deploy` | Upload build artifacts to remote server via SCP and restart Docker services |

Background service logs are written to `log/api.log` and `log/react.log`.

### Deployment workflow

```bash
# 1. Build production images
#    Prompts for target platform — press Enter for the default (linux/amd64),
#    or type e.g. linux/arm64 for ARM servers.
node devtool.mjs build

# 2. Deploy to remote server (prompts for SSH details, saves to .deploy.json)
node devtool.mjs deploy
```

The deploy step:
1. Reads (or prompts for) server address, SSH user, port, key path, and target directory — saved to `.deploy.json`
2. Creates a timestamped backup of the existing remote directory
3. Prunes unused Docker images on the remote host
4. Uploads `api.tar.gz`, `react.tar.gz`, `docker-compose.yml`, `nginx.conf`, and `.env` via SCP
5. Loads images and runs `docker compose up -d --force-recreate` on the remote host

> **Database safety:** Deployment does not touch the database volume. However, always back up the database before major operations using:
> ```bash
> docker exec kozitabor-postgres pg_dump -U <user> <db> > backup_$(date +%F).sql
> ```

---

## Useful Docker & Prisma Commands

```bash
# Run migrations
npx prisma migrate dev --name <migration-name>

# Regenerate Prisma client after schema changes
npx prisma generate

# Seed in a running production container
docker exec -it kozitabor-api node dist/seeder/seed.js
docker exec -it kozitabor-api node dist/seeder/users.js

# Read production logs
docker exec kozitabor-api tail -f /app/logs/combined.log
docker exec kozitabor-api tail -f /app/logs/error.log

# Remove containers and volumes (destructive!)
docker compose down -v
```

---

## Key Design Notes

- **`timeOffset`** — all time values are stored as **seconds** from midnight (`28800` = 08:00). This avoids timezone issues when camp days span multiple calendar dates.
- **`Setting.str_id`** — a stable, code-friendly slug derived from the label on creation. It never changes on update so it can be safely referenced in code by `str_id` (e.g. `app_status`, `camp_start_date`).
- **`liveProgram` endpoint** — `GET /api/liveProgram` returns `{ current, next }`, where `current` is the program running right now (or `null`) and `next` is the soonest upcoming one.
- **Admin DB cache** — the frontend caches API responses per entity to reduce redundant requests during navigation. Call `flushCache()` after bulk operations.
- **`app_status` setting** — controls which UI the participant app renders (`active` = camp-mode, `inactive` = pre/post-camp mode). Toggled from the admin dashboard.
- **App / server separation** — `src/app.ts` exports the Express app instance; `src/index.ts` starts the HTTP server. This allows the test suite to import the app directly without binding to a port.
