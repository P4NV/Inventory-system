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
  schema.prisma            Data models (User, Item)
  seed.ts                  82-sample-item seeder + 2 users
  migrations/              Versioned SQL migration files

src/
  main.ts                  Bootstrap: CORS, ValidationPipe, port 3000
  app.module.ts            Root module — registers ThrottlerGuard + JwtAuthGuard globally

  prisma/
    prisma.module.ts       @Global module — every module gets PrismaService
    prisma.service.ts      PrismaClient subclass using PrismaPg adapter

  auth/
    auth.controller.ts     POST /auth/register, /login, /guest | GET /auth/me
    auth.service.ts        Registration, login, guest login, JWT generation
    auth.module.ts         JwtModule, PassportModule, JwtStrategy
    decorators/
      public.decorator.ts  @Public() — bypasses the global JwtAuthGuard
    guards/
      jwt-auth.guard.ts    Global guard — checks @Public() metadata before enforcing auth
    strategies/
      jwt.strategy.ts      Validates Bearer tokens, queries DB for user existence
    dto/
      auth.dto.ts          RegisterDto, LoginDto with class-validator decorators

  items/
    items.controller.ts    GET /items — public, view-only
    items.service.ts       findAll() — Prisma query sorted by addedAt desc
    items.module.ts
```

## Authentication

The backend uses **JWT (JSON Web Tokens)** for stateless authentication.

### Global guard with public bypass

All routes are protected by default via `JwtAuthGuard` registered as a global `APP_GUARD`.
Routes marked with `@Public()` are accessible without authentication:

```ts
@Public()
@Post('register')
register(@Body() dto: RegisterDto) { ... }
```

| Endpoint | Auth | Why |
|----------|------|-----|
| `POST /auth/register` | Public | Registration |
| `POST /auth/login` | Public | Authentication |
| `POST /auth/guest` | Public | Guest session creation |
| `GET /items` | Public | View-only inventory |
| `GET /auth/me` | JWT required | Profile lookup |

### Auth flow

```
Client                    Backend
  │                         │
  ├─ POST /auth/login ─────→│
  │                         ├─ bcrypt.compare(password, hash)
  │                         ├─ JWT.sign({ sub, email, role }, { expiresIn: '7d' })
  │←──── { user, token } ──┤
  │                         │
  ├─ GET /items ───────────→│  (no auth required — @Public())
  │←──── 200 Item[] ───────┤
  │                         │
  ├─ GET /auth/me ─────────→│  (Authorization: Bearer <token>)
  │                         ├─ JwtStrategy.validate() — verifies JWT signature
  │                         ├─ AuthService.validateUser(id) — checks DB
  │←──── 200 User ─────────┤
```

### Guest sessions

`POST /auth/guest` creates an anonymous user with:
- Random UUID-based email and name
- `role: "guest"`
- 24-hour JWT expiry (vs 7 days for registered users)

## API endpoints

| Method | Path | Auth | Body | Status | Description |
|--------|------|------|------|--------|-------------|
| `GET` | `/health` | Public | — | `200` / `503` | DB connectivity check |
| `POST` | `/auth/register` | Public | `{ email, password, name? }` | `201` / `409` | Register new user |
| `POST` | `/auth/login` | Public | `{ email, password }` | `200` / `401` | Authenticate |
| `POST` | `/auth/guest` | Public | — | `201` | Guest session |
| `GET` | `/auth/me` | JWT | — | `200` / `401` | Current user profile |
| `GET` | `/items` | Public | — | `200` | List all items (newest first) |

## Data model

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

Supported categories: `general`, `electronics`, `furniture`, `clothing`, `food`, `tools`, `materials`

## Key patterns

### `@Public()` decorator

Routes that don't require auth use the `@Public()` decorator from `src/auth/decorators/public.decorator.ts`. It sets `isPublic: true` metadata that the global `JwtAuthGuard` checks before enforcing authentication.

```ts
@Public()
@Get()
findAll() { ... }
```

### Global `ValidationPipe`

Configured in `main.ts` — runs on every request:

```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,              // strips fields not in the DTO
  transform: true,              // auto-converts types
  forbidNonWhitelisted: true,   // rejects extra fields → 400
}));
```

### `PrismaService`

Extends `PrismaClient` with a `PrismaPg` driver adapter. Decorated with `@Global()` so every module can inject it without importing `PrismaModule`.

### Rate limiting

Two tiers configured globally via `@nestjs/throttler`:
- **Short:** 10 requests/second
- **Medium:** 60 requests/minute

## Adding a new resource

Each feature lives in its own folder:

1. **Model** — add to `prisma/schema.prisma`
2. **Migrate** — `npx prisma migrate dev --name <label>`
3. **DTOs** — create DTO files with `class-validator` decorators
4. **Service** — business logic with Prisma queries
5. **Controller** — HTTP layer, use `@Public()` for public routes
6. **Module** — wire controller + providers
7. **Register** — import in `app.module.ts`

## Environment

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/appdb?schema=public"
PORT=3000
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="<generate-a-strong-random-key>"
```

Generate a `JWT_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
