# inv-app — Inventory Management System

A full-stack inventory management application with real-time analytics, PDF reporting, and guest access. Built with React 19 + NestJS 11 + PostgreSQL.

```
inv-app/
  frontend/           React 19 SPA (Vite 8, Tailwind CSS v4, Recharts)
  backend/            NestJS 11 API (Prisma ORM 7, Passport JWT)
  docker-compose.yml  PostgreSQL 16 (port 5433)
```

---

## Features

- **Dashboard** — KPI cards, category breakdown bar charts, monthly activity trends, stock health donut chart
- **Inventory view** — Read-only item table with live search filtering by name, SKU, or category
- **PDF Reports** — Download Daily / Monthly / Yearly inventory reports with summary stats and full item table
- **Guest access** — Instant view-only session without sign-up (24h expiry)
- **User auth** — Register / Login with JWT-based authentication (7-day tokens)
- **Global search** — Cmd+K search bar that finds items and pages across the app

---

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Motion, Recharts, lucide-react, jsPDF |
| Backend | NestJS 11, Passport.js (JWT), Prisma ORM 7, PostgreSQL (driver adapters) |
| Database | PostgreSQL 16 (Docker) |
| Auth | bcryptjs, 7-day JWT tokens, guest sessions with 24h TTL |

---

## Quick start

### Prerequisites

- Node.js 20+ and npm
- Docker (for local PostgreSQL)

### 1. Install dependencies

```bash
npm run install:all
```

Installs both `frontend/` and `backend/`. The backend postinstall runs `prisma generate`.

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

### 4. Run database migrations

```bash
npm run prisma:migrate
```

### 5. Seed the database (optional)

```bash
npm run prisma:seed
```

Creates 80+ sample items across 10+ categories and two users (`admin@example.com` / `guest@example.com`, password: `password123`).

### 6. Run both apps

```bash
npm run dev
```

Frontend at `http://localhost:5173`, API at `http://localhost:3000`.

---

## Architecture

```
Browser (React SPA)
  │
  ├─ AuthContext              reactive auth state (user, login, logout, loading)
  ├─ InventoryProvider        items state + auto-fetch on mount
  ├─ ProtectedRoute           redirects to /login if unauthenticated
  ├─ GuestRoute               redirects to /dashboard if already logged in
  │
  └─ api.ts                   typed fetch wrapper (auto-attaches Bearer token)
       │
       ▼
NestJS API (Express on :3000)
  │
  ├─ Global JwtAuthGuard      checks @Public() metadata — blocks unauthenticated
  │   │                       requests unless route is marked public
  │   ├─ @Public()            AuthController (register, login, guest)
  │   └─ @Public()            ItemsController (list items)
  │
  ├─ ValidationPipe           whitelist, transform, forbidNonWhitelisted
  │
  ├─ AuthController           POST /auth/register, /login, /guest | GET /auth/me
  │   └─ AuthService          bcrypt hash/compare, JWT sign, guest user creation
  │
  ├─ ItemsController          GET /items (view-only, public)
  │   └─ ItemsService         Prisma query: all items ordered by addedAt desc
  │
  └─ PrismaService            PrismaClient with PrismaPg adapter
       │
       ▼
  PostgreSQL (Docker :5433)
```

### Key design decisions

- **View-only inventory** — Items are publicly readable via `GET /items`. Create, update, and delete operations have been removed to keep the app focused on viewing and reporting.
- **Public route pattern** — Routes are protected by default via a global `JwtAuthGuard`. Public routes are marked with `@Public()` decorator — no need for per-route guard configuration.
- **Guest sessions** — Anonymous users can log in as a guest (random UUID name, `role: "guest"`) for instant view-only access. Sessions expire after 24 hours.

---

## API reference

Base URL: `http://localhost:3000`

### `GET /health`

Checks database connectivity.

```json
{ "status": "ok", "database": "connected", "timestamp": "2026-07-17T15:44:21.944Z" }
```

### `POST /auth/register`

Creates a new user account. Returns `201` with user + JWT token.

| Field | Type | Constraints |
|-------|------|-------------|
| `email` | string | valid email, unique |
| `password` | string | 8–50 chars |
| `name` | string (optional) | max 100 chars |

Returns `409` if email is already registered.

### `POST /auth/login`

Authenticates and returns a JWT token (7-day expiry).

| Field | Type |
|-------|------|
| `email` | string |
| `password` | string |

Returns `401` on invalid credentials.

**Response:**

```json
{
  "user": { "id": "uuid", "email": "john@example.com", "name": "John", "role": "user", "createdAt": "..." },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### `POST /auth/guest`

Creates an anonymous guest session (24-hour token, `role: "guest"`). Returns same shape as login.

### `GET /auth/me`

Returns the authenticated user's profile. Requires `Authorization: Bearer <token>`.

```json
{ "id": "uuid", "email": "john@example.com", "name": "John", "role": "user" }
```

### `GET /items`

Returns all items, newest first. Public — no auth required.

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

---

## Data model

```prisma
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
```

| Column | DB Type | Notes |
|--------|---------|-------|
| `id` | text (UUID) | Auto-generated primary key |
| `name` | text | Item display name |
| `sku` | text | Stock keeping unit, unique |
| `amount` | integer | Current stock quantity |
| `price` | double precision | Unit price |
| `category` | text | Category label, defaults to `"general"` |
| `isInStock` | boolean | Stock status flag |
| `addedAt` | timestamp(3) | Creation timestamp |
| `updatedAt` | timestamp(3) | Auto-updated on write |

Supported categories: `general`, `electronics`, `furniture`, `clothing`, `food`, `tools`, `materials`

---

## Project structure

```
inv-app/
  docker-compose.yml          PostgreSQL 16
  package.json                Root scripts: install:all, dev, db:up/down

  backend/
    prisma/
      schema.prisma           Data models (User, Item)
      seed.ts                 82-sample-item seeder
      migrations/             Versioned SQL migrations
    src/
      main.ts                 Bootstrap: CORS, ValidationPipe, port 3000
      app.module.ts           Root module — global guards (Throttler, JwtAuth)
      prisma/
        prisma.service.ts     PrismaClient + PrismaPg driver adapter
      auth/
        auth.controller.ts    POST /register, /login, /guest | GET /me
        auth.service.ts       Registration, login, JWT, guest logic
        auth.module.ts        JwtModule, PassportModule, JwtStrategy
        decorators/
          public.decorator.ts @Public() — bypasses global JWT guard
        guards/
          jwt-auth.guard.ts   Global guard — checks @Public() metadata
        strategies/
          jwt.strategy.ts     Bearer token validation
        dto/
          auth.dto.ts         RegisterDto, LoginDto
      items/
        items.controller.ts   GET /items — public, view-only
        items.service.ts      findAll() — ordered by addedAt desc
        items.module.ts

  frontend/
    src/
      main.tsx                React root mount
      App.tsx                 Router: /login, /register, /, /dashboard, /inventory
      index.css               Tailwind v4 @theme design tokens
      config/
        navigation.ts         Nav items for sidebar
      layouts/
        DashboardLayout.tsx   Topbar + Sidebar + Outlet
      pages/
        Home.tsx              Landing page with stats cards
        Dashboard.tsx         Analytics: bar charts, pie chart, KPIs
        Inventory.tsx         View-only table + PDF report buttons
        AuthPage.tsx          Login / register / guest form
        NotFound.tsx          404
      components/
        ui/
          ErrorBoundary.tsx   Crash fallback UI
        nav/
          Sidebar.tsx         Nav + Download Report dropdown
          Topbar.tsx          Search (Cmd+K) + user dropdown with sign-out
        features/
          InventoryManager.tsx Read-only item table with search filtering
      lib/
        api.ts                Typed fetch client + all API methods
        auth-context.tsx      Auth state context (user, login, logout)
        inventory-context.tsx Items state + auto-fetch
        report.ts             PDF generation (jsPDF + jspdf-autotable)
        search.ts             Search scoring engine
```

---

## Pages

| Path | Page | Access | Description |
|------|------|--------|-------------|
| `/login` | AuthPage | Guest only | Sign in, register, or continue as guest |
| `/register` | AuthPage | Guest only | Create a new account |
| `/` | Home | Authenticated | KPI summary cards, quick action navigation |
| `/dashboard` | Dashboard | Authenticated | Analytics: bar charts by category, monthly trends, stock distribution |
| `/inventory` | Inventory | Authenticated | Item table with live search, PDF report downloads |
| `*` | NotFound | Public | 404 fallback |

---

## PDF Reports

Reports are generated entirely on the client side using **jsPDF** — no server-side rendering needed.

**Available periods:**
- **Daily** — items added today
- **Monthly** — items added this month
- **Yearly** — items added this year

**Report contents:**
- Branded header with period label and date range
- Summary cards: total items, total value, in-stock count, out-of-stock count
- Full item table: Name, SKU, Category, Qty, Price, Stock status
- Page numbers and generation timestamp

**Access points:**
- **Sidebar** — Download Report dropdown at the bottom
- **Inventory page** — Daily / Monthly / Yearly buttons in the top-right header

---

## Environment variables

| Variable | File | Default | Purpose |
|----------|------|---------|---------|
| `DATABASE_URL` | `backend/.env` | `postgresql://postgres:postgres@localhost:5433/appdb` | Postgres connection string |
| `PORT` | `backend/.env` | `3000` | API listen port |
| `FRONTEND_URL` | `backend/.env` | `http://localhost:5173` | CORS allow-origin |
| `JWT_SECRET` | `backend/.env` | _(required)_ | JWT signing key (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `VITE_API_URL` | `frontend/.env` | `http://localhost:3000` | API base URL for the frontend |

---

## Troubleshooting

**`/items` returns 500** — Restart the backend after schema changes. Run `npx prisma generate` in `backend/`.

**`password authentication failed for user "postgres"`** — Docker maps to port 5433 to avoid conflicts. Check your `DATABASE_URL`.

**CORS errors** — `FRONTEND_URL` in `backend/.env` must exactly match the frontend origin (including port).

**`JWT_SECRET is required`** — Set `JWT_SECRET` in `backend/.env`.

**Auth token lost on refresh** — Tokens persist in `localStorage` under `inv_token`. The `AuthContext` restores the session on mount.
