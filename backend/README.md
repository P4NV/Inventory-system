# Backend

NestJS 11 + PostgreSQL via Prisma ORM 7 (driver adapters — Prisma talks to
Postgres directly through `pg`, no separate query-engine process).

## Commands

```bash
npm install              # also runs `prisma generate` via postinstall
npm run start:dev        # start API in watch mode on http://localhost:3000
npm run build            # compile to dist/
npm run start:prod       # run the compiled build
npm run prisma:migrate   # create/apply a migration from schema.prisma
npm run prisma:generate  # regenerate the Prisma client (after schema changes)
npm run prisma:studio    # open Prisma Studio to browse/edit data in the browser
npm run test             # unit tests (Jest)
npm run test:e2e         # e2e tests (needs the database running)
npm run lint             # ESLint
npm run format           # Prettier
```

## Structure

```
prisma/
  schema.prisma            Data models (Item, User)
  config.ts                Prisma 7 config — holds DATABASE_URL for CLI commands
  migrations/              Versioned SQL migration files

src/
  main.ts                  Bootstrap: CORS, ValidationPipe, port
  app.module.ts            Root module — imports all feature modules
  app.controller.ts        GET / — server info + route listing

  prisma/
    prisma.module.ts       @Global module — every module gets PrismaService
    prisma.service.ts      PrismaClient subclass using PrismaPg adapter
                           Connects on init, disconnects on destroy

  health/
    health.controller.ts   GET /health — runs SELECT 1, returns DB status

  items/
    items.controller.ts    CRUD /items (POST/PATCH/DELETE guarded by JWT)
    items.service.ts       CRUD logic with NotFoundException + ConflictException (duplicate SKU)
    dto/
      create-item.dto.ts   POST body validation
      update-item.dto.ts   PATCH body validation (all optional)

  auth/
    auth.controller.ts     POST /auth/register, /login | GET /auth/me (JWT protected)
    auth.service.ts        Registration (bcrypt hash), login (bcrypt compare), JWT generation
    guards/
      jwt-auth.guard.ts    Passport-based JWT guard
    strategies/
      jwt.strategy.ts      Extracts and validates Bearer tokens
    dto/
      auth.dto.ts          RegisterDto, LoginDto with class-validator decorators
```

## Authentication

The backend uses **JWT (JSON Web Tokens)** for stateless authentication:

- **Registration** — `POST /auth/register` hashes the password with bcrypt (10 rounds),
  creates the user, and returns `{ user, token }`
- **Login** — `POST /auth/login` validates credentials with bcrypt.compare and returns
  `{ user, token }`
- **Token format** — JWT with `sub` (user ID), `email`, `role`, expires in 7 days
- **Validation** — `JwtStrategy` extracts the Bearer token, verifies the signature, and
  calls `AuthService.validateUser()` to confirm the user still exists
- **Protection** — `@UseGuards(JwtAuthGuard)` on write endpoints (`POST/PATCH/DELETE /items`)
- **Secret** — `JWT_SECRET` environment variable is **required**. The backend throws at startup
  if it's missing. No hardcoded fallback.

### Auth flow

```
Client                    Backend
  │                         │
  ├─ POST /auth/login ─────→│
  │                         ├─ bcrypt.compare(password, hash)
  │                         ├─ JWT.sign({ sub, email, role })
  │←──── { user, token } ──┤
  │                         │
  ├─ POST /items ──────────→│  (Authorization: Bearer <token>)
  │                         ├─ JwtStrategy.validate()
  │                         ├─ ItemsService.create()
  │←──── 201 Created ──────┤
```

## API endpoints

| Method | Path | Auth | Body | Status | Description |
|--------|------|------|------|--------|-------------|
| `GET` | `/` | — | — | `200` | Server info + route listing |
| `GET` | `/health` | — | — | `200`/`503` | DB connectivity check |
| `POST` | `/auth/register` | — | `{ email, password, name? }` | `201`/`409` | Register new user |
| `POST` | `/auth/login` | — | `{ email, password }` | `200`/`401` | Authenticate user |
| `GET` | `/auth/me` | JWT | — | `200`/`401` | Current user profile |
| `GET` | `/items` | — | — | `200` | List all items (public) |
| `POST` | `/items` | JWT | `{ name, sku, amount, price, category?, isInStock? }` | `201`/`409` | Create item |
| `PATCH` | `/items/:id` | JWT | any subset of fields | `200`/`404` | Partial update |
| `DELETE` | `/items/:id` | JWT | — | `204`/`404` | Delete item |

## Data model

### Item

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
```

### User

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
```

## How each layer works

### `main.ts` — Bootstrap

```ts
app.enableCors({ origin: process.env.FRONTEND_URL });  // single-origin CORS
app.useGlobalPipes(new ValidationPipe({                  // runs on every request
  whitelist: true,        // strips fields not in the DTO
  transform: true,        // auto-converts types (string → number, etc.)
  forbidNonWhitelisted: true,  // rejects requests with extra fields → 400
}));
```

### `PrismaService` — Database client

Extends `PrismaClient` with a `PrismaPg` adapter. Decorated with `@Global()` so
every module can inject it without importing `PrismaModule`.

### DTOs — Request validation

DTOs use `class-validator` decorators. The global `ValidationPipe` instantiates
the DTO class from the request body and validates it before the controller
method runs.

### ItemsService — Business logic

- `findAll()` — returns items ordered by `addedAt` descending
- `create()` — catches Prisma `P2002` (unique constraint) and throws `ConflictException` (409)
- `update()` — checks item exists first (404 if not), then updates
- `remove()` — checks item exists first (404 if not), then deletes
- `ensureExists()` — private helper, throws `NotFoundException` if the item doesn't exist

## Adding a new resource

Each feature lives in its own folder. The pattern is always the same:

1. **Model** — add to `prisma/schema.prisma`
2. **Migrate** — `npx prisma migrate dev --name <label>`
3. **DTOs** — `dto/create-<name>.dto.ts` and `dto/update-<name>.dto.ts`
4. **Service** — talks to Prisma, contains business logic
5. **Controller** — HTTP layer only, delegates to the service
6. **Module** — wires controller + providers
7. **Register** — import in `app.module.ts`

Copy `src/items/` as a starting template and rename inside.

## Environment

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/appdb?schema=public"
PORT=3000
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="<generate-a-strong-random-key>"
```

`JWT_SECRET` is required. Generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
