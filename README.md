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
- **Schedule** (`/program`) — daily program breakdown with time offsets; detail view per item
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
- **Camper tasks** — bulk assignment of activities to teams at specific times
- **Organizer activities** — activity type definitions for the organizer schedule
- **Organizer tasks** — scheduling contacts to activities at specific times
- **Packing list items** — manage the list of items participants should bring
- **Settings** — key-value store for app-wide configuration (e.g. `app_status`, dates, URLs)
- **Deadlines** — manage important deadlines shown to participants

---

## Data Model

```
User           — Admin accounts (email + bcrypt password, JWT auth)
Contact        — Organizers/leaders; ordered list, optional role and phone
Role           — Role taxonomy for contacts (e.g. "Csapatvezető")
Team           — Camp teams; connected to leaders (Contact) via Leader join table
Camper         — Team members (name, optional email)
Leader         — Join table: Team ↔ Contact
CamperActivity — Activity type for camper tasks (e.g. "Főzés")
CamperTask     — Team assigned to a CamperActivity at a specific day + timeOffset
OrganizerActivity — Activity type for organizer schedule
OrganizerTask  — Contact assigned to OrganizerActivity at a specific day + timeOffset
Program        — Schedule item with startDay/endDay and time offsets
Info           — Information card with optional Map and Media children
Map            — Google-Maps-compatible lat/lng/zoom for an Info card
Media          — File or image attachment for an Info card
Bring          — Packing list item
Deadline       — Named deadline with a UTC-normalized date
Setting        — Key-value config row; str_id is a stable slug derived from label
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
│   │   ├── controllers/    # Custom business logic handlers
│   │   ├── middleware/     # auth, param parsing, file upload
│   │   ├── routes/         # admin.ts, core.ts, auth.ts
│   │   ├── services/       # Generic CRUD service factory + entity services
│   │   ├── seeder/         # seed.ts (data), users.ts (admin accounts)
│   │   └── utils/
│   └── uploads/            # Uploaded files (not committed)
│
├── kozitabor-react/        # React + Vite frontend
│   └── src/
│       ├── components/     # Shared UI components (admin + core)
│       ├── context/        # React contexts: auth, DB cache, toast, theme
│       ├── features/       # Composite UI blocks (ProgramBlock, ContactBlock, …)
│       ├── layouts/        # AdminLayout, CoreLayout
│       ├── pages/
│       │   ├── admin/      # All admin CRUD pages + DashboardPage
│       │   └── core/       # All participant-facing pages
│       ├── types/          # Shared TypeScript types (database.ts, forms.ts)
│       └── utils/          # API client, date helpers
│
├── build/                  # Temporary build artifacts (generated by DevTool)
├── development-db/         # Local Docker PostgreSQL data volume
├── docker-compose.yml      # Production build orchestration
├── docker-compose-deploy.yml # Production deploy orchestration
├── nginx.conf              # Reverse proxy config (serves React, proxies API)
└── devtool.mjs             # Interactive CLI for dev, build, and deploy tasks
```

---

## Local Development Setup

### Prerequisites

- **Node.js** v18 or newer
- **Docker & Docker Compose** (for the local PostgreSQL database)

### 1. Start the local database

```bash
docker compose -f docker-compose.yml up kozitabor-db -d
```

This starts a PostgreSQL 15 container. The data is persisted in `./development-db`.

### 2. Configure environment variables

The API and the frontend each have a `.env.development` file committed to the repo with pre-filled local defaults:

- `kozitabor-api/.env.development` — database URL, JWT secret, ports, CORS origin
- `kozitabor-react/.env.development` — `VITE_API_BASE_URL` pointing to the local API

No changes are needed for a standard local setup.

### 3. Install dependencies

```bash
# Backend
cd kozitabor-api && npm install

# Frontend
cd ../kozitabor-react && npm install
```

Or use the DevTool:

```bash
node devtool.mjs init
```

### 4. Run database migrations

```bash
cd kozitabor-api
npx prisma migrate dev
```

### 5. Seed the database

```bash
# Populate content tables (programs, contacts, settings, etc.)
npm run seed

# Create an admin user account
npm run seedUser
```

### 6. Start the development servers

In separate terminals:

```bash
# Backend (hot-reload via tsx)
cd kozitabor-api && npm run dev

# Frontend (Vite HMR)
cd kozitabor-react && npm run dev
```

The participant app is available at `http://localhost:5173/kozitabor/` and the admin panel at `http://localhost:5173/kozitabor/admin`.

---

## Admin Authentication

The admin panel is protected by JWT. Use the credentials created by `npm run seedUser`. Tokens expire after the duration configured in `JWT_EXPIRES_IN` (default: `1h`).

---

## DevTool — Automation CLI

`devtool.mjs` is an interactive CLI for common tasks. Run it without arguments to see the full menu:

```bash
node devtool.mjs
```

### Available tasks

| Task | Description |
|---|---|
| `init` | Install npm dependencies for both packages |
| `dev` | Start the Vite dev server |
| `seed` | Run the database seeder |
| `build` | Compile the frontend and build Docker images |
| `deploy` | Transfer images and configs to a remote server via SCP and restart services |

### Deployment

The deploy task:
1. Prompts for (or reads from `.deploy.json`) the server address, SSH key path, and target directory
2. Creates a timestamped backup of the existing remote directory
3. Uploads Docker images (`.tar.gz`) and config files via SCP
4. Loads images and runs `docker compose up -d` on the remote host

> **Database safety:** The deployment process does not touch the database volume. However, if a full container reset becomes necessary, data loss is possible. Always back up the database before major operations.

---

## Environment Variables Reference

### `kozitabor-api/.env.development`

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `1h`, `7d`) |
| `CLIENT_URL` | Allowed CORS origin |
| `CLIENT_PORT` | Frontend port (used for CORS) |
| `API_PORT` | Port the API listens on |
| `IS_DEV` | Enables development-only features |

### `kozitabor-react/.env.development`

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API |

### Production (`.env` in repo root, not committed)

Used by `docker-compose.yml` to wire all services together. Copy `.env.sample` and fill in values before building.

---

## Key Design Notes

- **`timeOffset`** — all time values are stored as **seconds** from midnight (`28800` = 08:00). This avoids timezone issues when camp days span multiple calendar dates.
- **`Setting.str_id`** — a stable, code-friendly slug derived from the label on creation. It never changes on update so it can be referenced by `str_id` in code (e.g. `app_status`).
- **Admin DB cache** — the frontend caches API responses for 60 seconds per entity to reduce redundant requests during navigation. Call `flushCache()` after bulk operations.
- **`app_status` setting** — controls which UI the participant app renders (`active` = camp-mode, `inactive` = pre/post-camp mode). Toggled from the admin dashboard.
