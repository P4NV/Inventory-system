# Full-Stack Starter

React + TypeScript + Tailwind CSS v4 + Motion on the frontend. NestJS + Prisma
ORM 7 + PostgreSQL on the backend. Two independent apps in one repo, wired
together by a `.env`-configured API URL and CORS setting.

```
fullstack-app/
  frontend/          React app (Vite)
  backend/           NestJS API
  docker-compose.yml local PostgreSQL for development
```

## Setup

### 1. Prerequisites

- Node.js 20+ and npm
- Docker (for local PostgreSQL) — or a Postgres instance you already have

### 2. Install

```bash
npm run install:all
```

This installs both `frontend/` and `backend/`. Installing the backend also
runs `prisma generate`, which needs internet access the first time (it fetches
Prisma's query engine).

### 3. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

The defaults assume Postgres on `localhost:5432` with user/password
`postgres`/`postgres` and a database called `appdb` — matching
`docker-compose.yml` — and an API on port `3000`. Adjust if you're pointing at
a different database, or if port `5432` is already taken (see
[Troubleshooting](#troubleshooting)).

### 4. Start the database

```bash
npm run db:up
```

Then create the initial migration (only needed once, or whenever you change
`backend/prisma/schema.prisma`):

```bash
npm run prisma:migrate
```

### 5. Run both apps

```bash
npm run dev
```

This runs the frontend (`http://localhost:5173`) and backend
(`http://localhost:3000`) together. Open the frontend — the page pings
`/health` and shows a live connection badge, and the "Signals" panel below it
reads and writes real rows through the API.

Prefer separate terminals? `npm run dev --prefix frontend` and
`npm run start:dev --prefix backend` work the same way.

## What's wired up

- **CORS** — the API only accepts requests from `FRONTEND_URL` (set in
  `backend/.env`).
- **Validation** — every request body is checked against a DTO
  (`class-validator`); unknown fields are rejected.
- **Typed client** — `frontend/src/lib/api.ts` is a small typed fetch wrapper;
  extend it as you add endpoints.
- **One example resource** — `Item` (model in `schema.prisma`, module in
  `backend/src/items/`) shows the full pattern: DTO → controller → service →
  Prisma. Copy this folder as a template for your next resource.

## Development workflow: adding a feature

Everything you build follows the same four-step loop. Say you're adding an
`Order` resource — swap the name for whatever you're actually building.

### Step 1 — Data model

Add the model to `backend/prisma/schema.prisma`:

```prisma
model Order {
  id        String   @id @default(uuid())
  customer  String
  total     Int
  createdAt DateTime @default(now())

  @@map("orders")
}
```

Apply it:

```bash
cd backend
npx prisma migrate dev --name add_orders
```

This creates the table and regenerates the typed Prisma client
(`src/generated/prisma`) so `this.prisma.order.findMany()` etc. are
type-checked.

### Step 2 — Backend module

Copy `backend/src/items/` to `backend/src/orders/` and rename inside:

- `dto/create-order.dto.ts`, `dto/update-order.dto.ts` — the fields you'll
  accept, each with a `class-validator` decorator.
- `orders.service.ts` — swap `this.prisma.item` for `this.prisma.order`.
- `orders.controller.ts` — swap the route prefix and DTO types.
- `orders.module.ts` — same shape, new names.

Register it in `backend/src/app.module.ts`:

```ts
import { OrdersModule } from './orders/orders.module';
// ...
imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, HealthModule, ItemsModule, OrdersModule],
```

### Step 3 — Frontend page

Add typed calls to `frontend/src/lib/api.ts`, following the `items`/`Item`
pattern already there (types + `listItems`/`createItem`/etc.).

Create `frontend/src/pages/Orders.tsx`, then register the route in
`frontend/src/App.tsx`:

```tsx
<Route path="/orders" element={<Orders />} />
```

### Step 4 — Style it

The current look (the status panel, "Signals" log, palette) is a placeholder
proving the stack works — replace it. Adjust design tokens in
`frontend/src/index.css`'s `@theme` block (colors, fonts), then delete
`StackStatus`/`SignalLog` from `Home.tsx` once you don't need the demo.

Repeat this loop for every resource in your app.

## Architecture

**Request flow:** browser → `frontend/src/lib/api.ts` (typed `fetch`) →
NestJS controller → DTO validated by a global `ValidationPipe` → service →
`PrismaService` → Postgres, via a driver adapter (no separate query-engine
process — Prisma 7 talks to `pg` directly).

**Why the layers are split this way:**

- **Controller** — only knows about HTTP: routes, status codes, request/response
  shape. No business logic.
- **DTO** (`class-validator`) — the contract for what a request body must look
  like. Validation happens before the controller method body ever runs, so
  services can trust their input.
- **Service** — the actual logic, talking to Prisma. Keeping this separate
  from the controller means you can unit-test it without spinning up HTTP.
- **PrismaService** — a single global provider (`@Global()` in
  `prisma.module.ts`) so every module shares one client/connection pool
  instead of each feature module creating its own.

**Backend folder-per-resource:** each feature (`health/`, `items/`, and every
resource you add) is self-contained — its controller, service, and DTOs live
together. `app.module.ts` just imports and wires them up. This is what makes
the copy-`items/`-rename-it workflow above work cleanly.

**Frontend folders:**

```
src/
  components/   reusable UI pieces used by more than one page
  pages/        one file per route, composes components
  lib/          api.ts (backend client) and any other shared utilities
```

**Why Prisma 7's adapter pattern:** the client is generated as plain
TypeScript into `backend/src/generated/prisma` (not `node_modules`), and
`PrismaService` passes it a `PrismaPg` adapter built from `DATABASE_URL`
instead of the client owning its own connection string. `prisma.config.ts`
holds the URL for CLI commands (`migrate`, `studio`); the running app gets it
from `process.env.DATABASE_URL` at boot. This is a Prisma 7 change from
earlier versions — don't put `url` back in `schema.prisma`'s `datasource`
block, it'll fail validation.

**Env-based coupling:** the frontend and backend never import from each
other — they're connected purely through `VITE_API_URL` (frontend → knows
where the API is) and `FRONTEND_URL` (backend → CORS allow-list). That's the
only thing you need to change per environment (local, staging, prod).

## Troubleshooting

**`password authentication failed for user "postgres"`** — something else on
your machine is already listening on port 5432 (a native Postgres install is
common on Windows/Mac) and your app is talking to that instead of Docker.
Check with `docker compose ps` (is the container actually `Up`?) and
`netstat -ano | findstr :5432` (Windows) / `lsof -i :5432` (Mac/Linux) for
other listeners. Fastest fix: remap Docker's port —

```yaml
# docker-compose.yml
ports:
  - "5433:5432"
```

and update `DATABASE_URL` in `backend/.env` to use `5433`. Restart with
`docker compose down && docker compose up -d db`.

**Same error, but nothing else is on 5432** — a stale Docker volume from an
earlier run has a different password baked in (Postgres only applies
`POSTGRES_PASSWORD` the first time it initializes). Reset it:

```bash
docker compose down -v
docker compose up -d db
```

**`The table "public.<name>" does not exist`** — you added or changed a
model but haven't migrated yet. Run `npx prisma migrate dev --name <label>`
from `backend/`.

**`Failed to fetch sha256 checksum` / `binaries.prisma.sh ... 403`** during
`prisma generate` — outbound network access to Prisma's CDN is blocked
(corporate firewall, restricted sandbox, etc.). This needs to succeed at
least once per machine; try a different network or ask your network admin to
allow `binaries.prisma.sh`.

**CORS errors in the browser console** — `FRONTEND_URL` in `backend/.env`
must exactly match the origin the frontend is actually served from (protocol
+ host + port). `http://localhost:5173` and `http://127.0.0.1:5173` are
different origins to a browser.

**Port already in use (`5173` or `3000`)** — another process (maybe a
previous `npm run dev` that didn't shut down) is holding it. Find and stop
it, or change `server.port` in `frontend/vite.config.ts` / `PORT` in
`backend/.env`.

## Next steps

- For production, set real `DATABASE_URL`, `FRONTEND_URL`, and `VITE_API_URL`
  values wherever you deploy each app — these are the only three values that
  change between environments.
- Consider adding auth (e.g. `@nestjs/passport` + a `JwtStrategy`) once you
  have real users, following the same module pattern as `items/`.
