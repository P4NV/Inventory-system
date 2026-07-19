# Full-Stack Starter (inv-app)

React 19 + TypeScript + Tailwind CSS v4 + Motion + **lucide-react** on the frontend.
NestJS 11 + Prisma ORM 7 + PostgreSQL on the backend. Two independent apps in one repo.

```
inv-app/
  frontend/           React 19 SPA (Vite 8)
  backend/            NestJS 11 API
  docker-compose.yml  local PostgreSQL 16
```

---

## Quick start

### Prerequisites

- Node.js 20+ and npm
- Docker (for local PostgreSQL)

### 1. Install dependencies

```bash
npm run install:all
```

Installs both `frontend/` and `backend/`. The backend postinstall runs
`prisma generate` to build the typed Prisma client.

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` and set a strong `JWT_SECRET`.

### 3. Start the database

```bash
npm run db:up
```

### 4. Run both apps

```bash
npm run dev
```

Frontend at `http://localhost:5173`, API at `http://localhost:3000`.

---

## How it works

### Architecture overview

```
Browser (React SPA)
  └─ src/lib/api.ts              typed fetch wrapper (Bearer token from localStorage)
       │  VITE_API_URL (http://localhost:3000)
       │
       ├─ AuthContext             reactive auth state (user, login, logout)
       ├─ ProtectedRoute          redirects to /login if unauthenticated
       └─ GuestRoute              redirects to /dashboard if already logged in
       │
       ▼
NestJS API (Express)
  └─ Global ValidationPipe        whitelist, transform, forbidNonWhitelisted
       ├─ AuthController          POST /auth/register, /login | GET /auth/me (JWT)
       │    ├─ JwtStrategy        validates Bearer token from header
       │    └─ JwtAuthGuard       protects write endpoints
       ├─ ItemsController         CRUD /items (create/update/delete require JWT)
       │    └─ ItemsService       business logic, Prisma queries, P2002 → 409
       └─ PrismaService           global PrismaClient + PrismaPg adapter
            └─ PostgreSQL         Docker, port 5433
```

### Request lifecycle

1. Frontend calls `api.listItems()` (token from `localStorage` auto-attached via `Authorization` header)
2. `api.ts` sends `fetch` to `VITE_API_URL + path`
3. NestJS matches the route to a controller method
4. The global `ValidationPipe` validates the request body against the DTO
   - `whitelist: true` strips unknown fields
   - `forbidNonWhitelisted: true` rejects requests with extra fields
   - `transform: true` auto-converts types
5. Protected endpoints (`POST/PATCH/DELETE /items`) run through `JwtAuthGuard`
6. The controller calls the service method
7. The service uses `PrismaService` to query Postgres
8. Unique constraint violations (duplicate SKU) return `409 Conflict`
9. Missing items return `404 NotFound`
10. The response is returned as JSON

### CORS

The backend only accepts requests from the origin in `FRONTEND_URL`
(`backend/.env`). This must match the protocol + host + port the frontend is
served from.

---

## API reference

All endpoints are prefixed with the base URL (`http://localhost:3000`).

### `GET /`

Returns server info and available routes.

```json
{ "name": "backend", "status": "ok", "routes": ["/health", "/items", "/auth"] }
```

### `GET /health`

Checks database connectivity. Returns `200` if the DB responds, `503` if not.

```json
{ "status": "ok", "database": "connected", "timestamp": "2026-07-17T15:44:21.944Z" }
```

### `POST /auth/register`

Creates a new user. Returns `201` with user + JWT token.

**Body:**

| Field | Type | Constraints |
|-------|------|-------------|
| `email` | string | valid email, unique |
| `password` | string | 8-50 chars |
| `name` | string (optional) | max 100 chars |

Returns `409` if the email is already registered.

### `POST /auth/login`

Authenticates and returns a JWT token.

**Body:**

| Field | Type | Constraints |
|-------|------|-------------|
| `email` | string | valid email |
| `password` | string | — |

Returns `401` on invalid credentials.

**Response:**

```json
{
  "user": { "id": "uuid", "email": "john@example.com", "name": "John", "role": "user", "createdAt": "..." },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### `GET /auth/me`

Returns the authenticated user's profile. Requires `Authorization: Bearer <token>` header.

```json
{ "id": "uuid", "email": "john@example.com", "name": "John", "role": "user" }
```

### `GET /items`

Returns all items, newest first. Public.

```json
[
  {
    "id": "uuid",
    "name": "Widget",
    "sku": "WDG-001",
    "amount": 25,
    "price": 9.99,
    "category": "electronics",
    "isInStock": true,
    "addedAt": "2026-07-17T...",
    "updatedAt": "2026-07-17T..."
  }
]
```

### `POST /items`

Creates a new item. Requires JWT authentication.

**Body (required fields):**

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | string | not empty, max 200 chars |
| `sku` | string | not empty, max 50 chars, must be unique |
| `amount` | integer | >= 0 |
| `price` | number | >= 0 |

**Optional:**

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `category` | string | `"general"` | max 100 chars. Predefined: `general`, `electronics`, `furniture`, `clothing`, `food`, `tools`, `materials` |
| `isInStock` | boolean | `true` | |

Returns `409` if SKU already exists.

**Validation errors (400):**

```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "sku must be shorter than or equal to 50 characters"],
  "error": "Bad Request"
}
```

### `PATCH /items/:id`

Partially updates an item. Requires JWT authentication. All fields optional.

Returns `404` if the item doesn't exist.

### `DELETE /items/:id`

Deletes an item. Requires JWT authentication. Returns `204`. Returns `404` if not found.

---

## Data model

```prisma
model Item {
  id        String   @id @default(uuid())
  name      String
  sku       String   @unique
  amount    Int      @default(0)
  price     Float    @default(0)
  category  String   @default("general")
  isInStock Boolean  @default(true)
  addedAt   DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("items")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("users")
}
```

| Column | DB Type | Notes |
|--------|---------|-------|
| `id` | text (UUID) | Auto-generated, primary key |
| `name` | text | Item display name |
| `sku` | text | Stock keeping unit, unique index |
| `amount` | integer | Current stock quantity |
| `price` | double precision | Unit price |
| `category` | text | Item category, defaults to `"general"` |
| `isInStock` | boolean | Whether the item is considered in stock |
| `addedAt` | timestamp(3) | When the record was created |
| `updatedAt` | timestamp(3) | Auto-updated on every write |

---

## Project structure

```
inv-app/
  docker-compose.yml          PostgreSQL 16 container (port 5433)
  package.json                Root scripts (install:all, dev, db:up, etc.)

  backend/
    prisma/
      schema.prisma           Data models (Item, User)
      config.ts               Prisma config for CLI commands
      migrations/             Versioned SQL migrations
    src/
      main.ts                 Bootstrap: CORS, ValidationPipe, port
      app.module.ts           Root module
      app.controller.ts       GET / — server info
      prisma/
        prisma.module.ts      @Global module
        prisma.service.ts     PrismaClient via PrismaPg driver adapter
      health/
        health.controller.ts  GET /health — DB ping
      items/
        items.controller.ts   CRUD /items (POST/PATCH/DELETE guarded)
        items.service.ts      CRUD logic, unique constraint handling
        dto/
          create-item.dto.ts
          update-item.dto.ts
      auth/
        auth.controller.ts    POST /auth/register, /login | GET /auth/me
        auth.service.ts       Registration, login, JWT generation
        guards/
          jwt-auth.guard.ts
        strategies/
          jwt.strategy.ts     Validates Bearer tokens
        dto/
          auth.dto.ts         RegisterDto, LoginDto

  frontend/
    src/
      main.tsx                React root mount
      App.tsx                 Router with auth-aware route guards
      index.css               Tailwind v4 + @theme design tokens
      config/
        navigation.ts         Nav items for sidebar
      layouts/
        DashboardLayout.tsx   Topbar + Sidebar + <Outlet/>
      pages/
        Home.tsx              Landing page with stats and quick actions
        Dashboard.tsx         Analytics with Recharts bar charts
        Inventory.tsx         CRUD page
        AuthPage.tsx          Login/register form
        NotFound.tsx          404 page
      components/
        ui/
          Modal.tsx           Native <dialog> wrapper
          ErrorBoundary.tsx   Catches React crash errors
        nav/
          Sidebar.tsx         NavLink sidebar with lucide-react icons
          Topbar.tsx          Auth-aware top bar with user dropdown
        features/
          StackStatus.tsx     Health check display (3-layer stack)
          SignalLog.tsx       Animated item list (demo)
          InventoryManager.tsx CRUD table + add modal
      lib/
        api.ts                Typed fetch client, types, API methods
        auth-context.tsx      Reactive auth state (user, login, logout)
```

---

## Authentication flow

1. User submits login/register form on `AuthPage`
2. `api.login()` / `api.register()` sends credentials to the backend
3. Backend validates credentials (bcrypt compare) or creates user (bcrypt hash)
4. Returns `{ user, token }` where token is a JWT signed with `JWT_SECRET` (7-day expiry)
5. Frontend stores the token in `localStorage` via `AuthContext.login()`
6. `AuthContext` fetches the user profile via `GET /auth/me` on page load
7. `ProtectedRoute` redirects to `/login` if no user is found
8. `GuestRoute` redirects to `/dashboard` if already authenticated
9. All API requests automatically attach `Authorization: Bearer <token>` from `localStorage`
10. On 401 responses, the token is cleared and the user is logged out
11. `JWT_SECRET` is required — the backend throws on startup if missing

---

## Environment variables

| Variable | File | Default | Purpose |
|----------|------|---------|---------|
| `DATABASE_URL` | `backend/.env` | `postgresql://postgres:postgres@localhost:5433/appdb` | Postgres connection |
| `PORT` | `backend/.env` | `3000` | API listen port |
| `FRONTEND_URL` | `backend/.env` | `http://localhost:5173` | CORS allow-origin |
| `JWT_SECRET` | `backend/.env` | _(required)_ | JWT signing key |
| `VITE_API_URL` | `frontend/.env` | `http://localhost:3000` | API base URL for frontend |

---

## How to add a new page

1. **Add nav entry** in `src/config/navigation.ts` — sidebar updates automatically.
2. **Create the page** in `src/pages/`.
3. **Register the route** in `src/App.tsx` inside the layout block.

---

## How to add a new API resource

1. **Model** — add to `backend/prisma/schema.prisma`
2. **Migrate** — `npx prisma migrate dev --name <label>`
3. **DTOs** — create DTO files with `class-validator` decorators
4. **Service** — business logic with Prisma queries
5. **Controller** — HTTP layer, use `@UseGuards(JwtAuthGuard)` for write endpoints
6. **Module** — wire controller + providers, register in `app.module.ts`

---

## Troubleshooting

**`/items` returns 500** — Restart the backend after schema changes.
Run `npx prisma generate` in `backend/`.

**`password authentication failed for user "postgres"`** — Check port 5432.
Docker maps to 5433 to avoid conflicts.

**CORS errors** — `FRONTEND_URL` must exactly match the frontend origin.

**`JWT_SECRET is required`** — Set `JWT_SECRET` in `backend/.env`.

**Auth token lost on refresh** — Not anymore. Tokens persist in `localStorage`
under key `inv_token`. The `AuthContext` restores the session on mount.
