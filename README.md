# AREA (AÉRA)

AÉRA is a multi-platform application (backend, web frontend, and mobile) for creating and exploring "areas" and widgets.

This repository contains three main parts:

- `backend/` — NestJS API with Prisma for data persistence
- `web/` — React + TypeScript frontend built with Vite
- `mobile/` — Flutter mobile app

This README provides quick setup and development instructions. See `CONTRIBUTING.md` for contribution guidelines.

---

## Quick Links

- Backend: `backend/`
- Web: `web/`
- Mobile: `mobile/`

---

## Tech Stack

- Backend: NestJS, TypeScript, Prisma, PostgreSQL
- Frontend (web): React, TypeScript, Vite, TailwindCSS, Axios
- Mobile: Flutter (Dart)
- Testing: Jest (backend e2e present), React testing tools (web)

---

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Docker & Docker Compose (optional, recommended for DB)
- Flutter SDK (for mobile development)

---

## Environment

Create environment files where needed.

- Backend: `backend/.env` (example keys)

  - DATABASE_URL=postgresql://user:pass@localhost:5432/area_db
  - JWT_SECRET=your_jwt_secret
  - PORT=3000

- Web: create `.env` or use `VITE_API_URL`

  - VITE_API_URL=http://localhost:3000

- Mobile: see `mobile/pubspec.yaml` and Flutter docs for env setup

---

## Running Locally

### Using Docker Compose (recommended for quick start)

If a `docker-compose.yml` is present at the repo root, use it to start the database and other services:

```bash
# from repo root
docker-compose up -d postgres
```

Then follow the service-specific steps below.

### Backend (NestJS)

```bash
cd backend
npm install
# run database migration / generate prisma client
npx prisma migrate dev --name init --schema=./prisma/schema.prisma
# or if no migration needed:
# npx prisma generate --schema=./prisma/schema.prisma
# start in dev mode (hot reload)
npm run start:dev
```

Default server: http://localhost:3000

### Web (React + Vite)

```bash
cd web
npm install
# set VITE_API_URL in .env to your backend URL
npm run dev
```

Open the app at the address Vite prints (usually http://localhost:5173).

### Mobile (Flutter)

```bash
cd mobile
# run on a connected device or simulator
flutter pub get
flutter run
```

---

## Scripts (examples)

The exact script names may vary between `package.json`s. Common scripts:

- `npm run dev` — start dev server
- `npm run build` — build production bundle
- `npm run lint` — run linters
- `npm run format` — format code

Check each package's `package.json` for the exact script names.

---

## Development Notes

- The web app reads `VITE_API_URL` at build/runtime to contact the backend.
- Authentication uses JWT stored in `localStorage` under `authToken`.
- Services and API clients live in `web/src/services/api` for a clean separation of concerns.

---

## Linting & Formatting

- Backend & Web: ESLint + Prettier or similar (see each package's config)
- Run linters with `npm run lint` in the corresponding folder

---

## Troubleshooting

- 401 / no token: Ensure backend `JWT_SECRET` matches the secret used to issue tokens and `VITE_API_URL` points to the running backend.
- Database errors: Confirm Docker/Postgres is running and `DATABASE_URL` is correct.

---

## Where to go next

- See `CONTRIBUTING.md` for contribution workflow, branch naming, and PR expectations.

---

## License & Authors

See `LICENSE` file for license details.

---

## Architecture

High-level architecture diagrams (class and sequence diagrams) are available in the repository docs: [docs/architecture/README.md](docs/architecture/README.md).
