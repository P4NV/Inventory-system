# Full-Stack Starter (inv-app)

React + TypeScript + Tailwind CSS v4 + Motion on the frontend. NestJS + Prisma
ORM 7 + PostgreSQL on the backend. Two independent apps in one repo, wired
together by a `.env`-configured API URL and CORS setting.

```
inv-app/
  frontend/           React 19 app (Vite)
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
  └─ src/lib/api.ts          typed fetch wrapper
       │  VITE_API_URL (http://localhost:3000)
       ▼
NestJS API (Express)
  └─ Controller              HTTP layer: routes, status codes, params
       └─ DTO                class-validator decorators validate the body
            └─ Service       business logic, talks to Prisma
                 └─ PrismaService  single global connection pool
                      └─ PostgreSQL (Docker, port 5433)
```

### Request lifecycle

1. Frontend calls `api.listItems()` (or any method in `api.ts`)
2. `api.ts` sends a typed `fetch` to `VITE_API_URL + path`
3. NestJS matches the route to a controller method
4. The global `ValidationPipe` validates the request body against the DTO
   - `whitelist: true` strips unknown fields
   - `forbidNonWhitelisted: true` rejects requests with extra fields
   - `transform: true` auto-converts types (strings to numbers, etc.)
5. The controller calls the service method
6. The service uses `PrismaService` (a PrismaClient instance) to query Postgres
7. The response is returned as JSON

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
{ "name": "backend", "status": "ok", "routes": ["/health", "/items"] }
```

### `GET /health`

Checks database connectivity. Returns `200` if the DB responds, `503` if not.

```json
{ "status": "ok", "database": "connected", "timestamp": "2026-07-17T15:44:21.944Z" }
```

### `GET /items`

Returns all items, newest first.

```json
[
  {
    "id": "uuid",
    "name": "Widget",
    "sku": "WDG-001",
    "amount": 25,
    "price": 9.99,
    "isInStock": true,
    "addedAt": "2026-07-17T...",
    "updatedAt": "2026-07-17T..."
  }
]
```

### `POST /items`

Creates a new item. Returns `201`.

**Body (required fields):**

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | string | not empty, max 200 chars |
| `sku` | string | not empty, max 50 chars, must be unique |
| `amount` | integer | >= 0 |
| `price` | number | >= 0 |

**Optional:**

| Field | Type | Default |
|-------|------|---------|
| `isInStock` | boolean | `true` |

**Example:**

```json
{ "name": "Widget", "sku": "WDG-001", "amount": 25, "price": 9.99 }
```

**Validation errors (400):**

```json
{
  "statusCode": 400,
  "message": ["name should not be empty", "sku must be shorter than or equal to 50 characters"],
  "error": "Bad Request"
}
```

### `PATCH /items/:id`

Partially updates an item. Returns `200`. All fields are optional — only send
the fields you want to change.

**Body (all optional):**

| Field | Type |
|-------|------|
| `name` | string |
| `sku` | string |
| `amount` | integer |
| `price` | number |
| `isInStock` | boolean |

**Example — toggle stock:**

```json
{ "isInStock": false }
```

**Example — update price and quantity:**

```json
{ "price": 7.50, "amount": 50 }
```

Returns `404` if the item doesn't exist.

### `DELETE /items/:id`

Deletes an item. Returns `204` (no body). Returns `404` if the item doesn't
exist.

---

## Data model

```prisma
model Item {
  id        String   @id @default(uuid())
  name      String
  sku       String   @unique
  amount    Int      @default(0)
  price     Float    @default(0)
  isInStock Boolean  @default(true)
  addedAt   DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("items")
}
```

| Column | DB Type | Notes |
|--------|---------|-------|
| `id` | text (UUID) | Auto-generated, primary key |
| `name` | text | Item display name |
| `sku` | text | Stock keeping unit, unique index |
| `amount` | integer | Current stock quantity |
| `price` | double precision | Unit price |
| `isInStock` | boolean | Whether the item is considered in stock |
| `addedAt` | timestamp(3) | When the record was created |
| `updatedAt` | timestamp(3) | Auto-updated on every write |

There is also an `InventoryItem` model in the schema (migrated but unused — no
controller or frontend yet).

---

## Project structure

```
inv-app/
  docker-compose.yml          PostgreSQL 16 container
  package.json                Root scripts (install:all, dev, db:up, etc.)

  backend/
    prisma/
      schema.prisma           Data models
      config.ts               Prisma 7 config (URL for CLI commands)
      migrations/             Versioned SQL migrations
    src/
      main.ts                 Bootstrap: CORS, ValidationPipe, port
      app.module.ts           Root module — imports all feature modules
      app.controller.ts       GET / — server info
      prisma/
        prisma.module.ts      @Global module (every module gets PrismaService)
        prisma.service.ts     PrismaClient via PrismaPg driver adapter
      health/
        health.module.ts
        health.controller.ts  GET /health — DB ping
      items/
        items.module.ts
        items.controller.ts   GET/POST/PATCH/DELETE /items
        items.service.ts      CRUD logic, Prisma queries
        dto/
          create-item.dto.ts  Validated body for POST
          update-item.dto.ts  Validated body for PATCH

  frontend/
    src/
      main.tsx                React root mount
      App.tsx                 Router: nested layout routes
      index.css               Tailwind v4 + @theme design tokens
      config/
        navigation.ts         Nav items array (single source of truth)
      layouts/
        DashboardLayout.tsx   Topbar + Sidebar + <Outlet/> (shared layout)
      pages/
        Home.tsx              Landing page (health + signal log)
        Inventory.tsx         Inventory CRUD page
        NotFound.tsx          404 (outside dashboard layout)
      components/
        nav/
          Sidebar.tsx         NavLink-based sidebar (active state styling)
          Topbar.tsx          Top bar
        features/
          StackStatus.tsx     Health check display
          SignalLog.tsx       Read-only item list (home page demo)
          InventoryManager.tsx  Full CRUD table (inventory page)
      lib/
        api.ts                Typed fetch client, types, API methods
```

---

## How to add a new page

1. **Add nav entry** in `src/config/navigation.ts`:
   ```ts
   { title: "Orders", path: "/orders" }
   ```
   This automatically appears in the sidebar.

2. **Create the page** in `src/pages/Orders.tsx`:
   ```tsx
   export function Orders() {
     return <div className="mx-auto max-w-3xl"><h1>Orders</h1></div>;
   }
   ```

3. **Register the route** in `src/App.tsx` inside the layout block:
   ```tsx
   <Route element={<DashboardLayout />}>
     <Route path="/" element={<Home />} />
     <Route path="/inventory" element={<Inventory />} />
     <Route path="/orders" element={<Orders />} />
   </Route>
   ```

4. The page automatically gets the sidebar + topbar from `DashboardLayout`.

### Pages outside the dashboard layout

For pages that shouldn't have the sidebar (like login, 404), add them outside
the `<Route element={<DashboardLayout />}>` block:

```tsx
<Route path="/login" element={<Login />} />
<Route path="*" element={<NotFound />} />
```

---

## How to add a new API resource

Everything follows the same pattern. Say you're adding `Order`.

### Step 1 — Data model

Add to `backend/prisma/schema.prisma`:

```prisma
model Order {
  id        String   @id @default(uuid())
  customer  String
  total     Float
  createdAt DateTime @default(now())

  @@map("orders")
}
```

Apply:

```bash
cd backend
npx prisma migrate dev --name add_orders
```

This creates the table and regenerates the Prisma client so
`this.prisma.order.findMany()` etc. are type-checked.

### Step 2 — Backend module

Copy `backend/src/items/` to `backend/src/orders/` and rename inside:

- `dto/create-order.dto.ts` — fields with `class-validator` decorators
- `dto/update-order.dto.ts` — partial version (all fields optional)
- `orders.service.ts` — swap `this.prisma.item` → `this.prisma.order`
- `orders.controller.ts` — swap route prefix and DTO types
- `orders.module.ts` — same shape, new names

Register in `backend/src/app.module.ts`:

```ts
import { OrdersModule } from './orders/orders.module';
// ...
imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, HealthModule, ItemsModule, OrdersModule],
```

Update `app.controller.ts` to list the new route:

```ts
routes: ['/health', '/items', '/orders'],
```

### Step 3 — Frontend API client

Add to `frontend/src/lib/api.ts`:

```ts
export type Order = {
  id: string;
  customer: string;
  total: number;
  createdAt: string;
};

export type CreateOrderInput = {
  customer: string;
  total: number;
};

// Add to the api object:
createOrder: (data: CreateOrderInput) =>
  request<Order>("/orders", { method: "POST", body: JSON.stringify(data) }),
listOrders: () => request<Order[]>("/orders"),
deleteOrder: (id: string) => request<void>(`/orders/${id}`, { method: "DELETE" }),
```

### Step 4 — Frontend page + route

Create `src/pages/Orders.tsx`, add nav entry in `config/navigation.ts`, and
register the route in `App.tsx` (see [How to add a new page](#how-to-add-a-new-page)).

### Step 5 — Feature component

Create `src/components/features/OrderManager.tsx` with your CRUD UI, import it
into the page.

---

## How to modify the Item model

### Adding a field

1. Add the column to `schema.prisma`:
   ```prisma
   model Item {
     // ...existing fields...
     category String @default("general")
   }
   ```
2. Create a migration:
   ```bash
   cd backend
   npx prisma migrate dev --name add_category
   ```
   For existing rows, Prisma may ask for a default — provide one inline or
   create the migration manually with `--create-only` and write the SQL.
3. Update `CreateItemDto` and `UpdateItemDto` with validation decorators.
4. Update the `Item` type in `frontend/src/lib/api.ts`.
5. Update any frontend components that display or edit the field.

### Renaming a field

Prisma can't rename columns automatically. The manual approach:

1. `npx prisma migrate dev --create-only --name rename_field`
2. Edit the generated SQL:
   ```sql
   ALTER TABLE "items" ADD COLUMN "new_name" TEXT;
   UPDATE "items" SET "new_name" = "old_name";
   ALTER TABLE "items" DROP COLUMN "old_name";
   ```
3. Update `schema.prisma` to remove the old field and add the new one.
4. Run `npx prisma migrate deploy`.
5. Update DTOs, service, frontend types.

### Deleting a field

1. Remove from `schema.prisma`.
2. Create migration (`npx prisma migrate dev --name remove_field`).
3. Update DTOs (remove from create/update), service, frontend types.

---

## How to scale

### Adding more pages

Follow the pattern in [How to add a new page](#how-to-add-a-new-page). The
sidebar updates automatically from `config/navigation.ts`.

### Adding authentication

1. Install: `npm install @nestjs/passport @nestjs/jwt passport passport-jwt`
2. Create `backend/src/auth/` module with a `JwtStrategy` and `AuthGuard`.
3. Apply `@UseGuards(JwtAuthGuard)` to controllers that need protection.
4. On the frontend, store the token and add it to `api.ts` requests:
   ```ts
   headers: {
     "Content-Type": "application/json",
     Authorization: `Bearer ${token}`,
   },
   ```

### Adding state management

For complex shared state (e.g. user session, cart), add a context or a store:

- **React Context** — for simple global state (theme, user)
- **Zustand** — for complex state with minimal boilerplate
  ```bash
  cd frontend && npm install zustand
  ```

### Deploying

1. **Backend**: `npm run build` produces `dist/`. Run with `node dist/main`.
   Set real `DATABASE_URL`, `FRONTEND_URL`, and `PORT` env vars.
2. **Frontend**: `npm run build` produces `dist/`. Serve with any static host.
   Set `VITE_API_URL` to your production API URL before building.
3. **Database**: Use a managed Postgres service (Neon, Supabase, RDS). Update
   `DATABASE_URL` accordingly.

---

## Environment variables

| Variable | File | Default | Purpose |
|----------|------|---------|---------|
| `DATABASE_URL` | `backend/.env` | `postgresql://postgres:postgres@localhost:5433/appdb` | Postgres connection |
| `PORT` | `backend/.env` | `3000` | API listen port |
| `FRONTEND_URL` | `backend/.env` | `http://localhost:5173` | CORS allow-origin |
| `VITE_API_URL` | `frontend/.env` | `http://localhost:3000` | API base URL for frontend |

These are the only values that change between environments.

---

## Troubleshooting

**`/items` returns 500** — The backend needs a restart after schema changes.
Kill the `nest start --watch` process and restart with `npm run dev`, or run
`npx prisma generate` in `backend/` to regenerate the client.

**`password authentication failed for user "postgres"`** — Something else on
your machine is on port 5432 (common with native Postgres installs). Check
with `netstat -ano | findstr :5432`. Fix: remap Docker's port in
`docker-compose.yml` to `5433:5432` and update `DATABASE_URL`.

**`The table "public.<name>" does not exist`** — Run `npx prisma migrate dev`
from `backend/`.

**CORS errors** — `FRONTEND_URL` must exactly match the frontend origin
(protocol + host + port). `http://localhost:5173` ≠ `http://127.0.0.1:5173`.

**Port in use** — Find and stop the process, or change `server.port` in
`frontend/vite.config.ts` / `PORT` in `backend/.env`.
