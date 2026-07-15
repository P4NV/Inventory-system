# Backend

NestJS 11 + PostgreSQL via Prisma ORM 7 (driver adapters, no Rust engine for
the client).

## Commands

```bash
npm install          # also runs `prisma generate` via postinstall
npm run start:dev    # start API in watch mode on http://localhost:3000
npm run build        # compile to dist/
npm run prisma:migrate  # create/apply a migration from prisma/schema.prisma
npm run prisma:studio   # open Prisma Studio to browse data
npm run test          # unit tests
npm run test:e2e      # e2e tests (needs the database running)
```

## Structure

```
prisma/schema.prisma   data model (currently: Item)
prisma.config.ts        Prisma 7 config (schema + migrations path)
src/
  prisma/               PrismaService / PrismaModule (global)
  health/                GET /health — checks the DB connection
  items/                 GET/POST/PATCH/DELETE /items — sample CRUD resource
  app.module.ts          wires everything together
  main.ts                CORS, validation pipe, bootstrap
```

## Environment

Copy `.env.example` to `.env`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/appdb?schema=public"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```
