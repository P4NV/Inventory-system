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
  schema.prisma            Data models (Item, InventoryItem)
  config.ts                Prisma 7 config — holds DATABASE_URL for CLI commands
  migrations/              Versioned SQL migration files
    20260715210910_init/
    20260716074226_add_inventory_items/
    20260717000000_update_item_fields/
    20260717000001_add_missing_item_columns/
    20260717000002_add_category/
    migration_lock.toml

src/
  main.ts                  Bootstrap: CORS, ValidationPipe, port
  app.module.ts            Root module — imports all feature modules
  app.controller.ts        GET / — server info + route listing

  prisma/
    prisma.module.ts        @Global module — every module gets PrismaService
    prisma.service.ts       PrismaClient subclass using PrismaPg adapter
                            Connects on init, disconnects on destroy

  health/
    health.module.ts
    health.controller.ts    GET /health — runs SELECT 1, returns DB status

  items/
    items.module.ts
    items.controller.ts     GET/POST/PATCH/DELETE /items
    items.service.ts        CRUD logic with NotFoundException handling
    dto/
      create-item.dto.ts    POST body: name, sku, amount, price, category?, isInStock?
      update-item.dto.ts    PATCH body: all fields optional
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

Extends `PrismaClient` with a `PrismaPg` adapter built from `DATABASE_URL`.
Decorated with `@Global()` so every module can inject it without importing
`PrismaModule` repeatedly.

```ts
constructor() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  super({ adapter });
}
```

### DTOs — Request validation

DTOs use `class-validator` decorators. The global `ValidationPipe` instantiates
the DTO class from the request body and validates it before the controller
method runs.

```ts
// create-item.dto.ts
export class CreateItemDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  name!: string;

  @IsString() @IsNotEmpty() @MaxLength(50)
  sku!: string;

  @IsInt() @Min(0)
  amount!: number;

  @IsNumber() @Min(0)
  price!: number;

  @IsString() @IsOptional() @MaxLength(100)
  category?: string;       // defaults to "general"

  @IsBoolean() @IsOptional()
  isInStock?: boolean;
}
```

### Controller → Service → Prisma

```
Controller                  Service                   PrismaService
─────────────              ─────────                 ─────────────
findAll()          →       findAll()          →       prisma.item.findMany()
create(dto)        →       create(dto)        →       prisma.item.create({ data: dto })
update(id, dto)    →       ensureExists(id)   →       prisma.item.findUnique()
               └→          update(id, dto)    →       prisma.item.update({ where: { id }, data: dto })
remove(id)         →       ensureExists(id)   →       prisma.item.findUnique()
               └→          remove(id)         →       prisma.item.delete({ where: { id } })
```

The service always checks `ensureExists` before update/delete and throws
`NotFoundException` (404) if the item doesn't exist.

## API endpoints

| Method | Path | Body | Status | Description |
|--------|------|------|--------|-------------|
| `GET` | `/` | — | `200` | Server info + route listing |
| `GET` | `/health` | — | `200` or `503` | DB connectivity check |
| `GET` | `/items` | — | `200` | List all items (newest first) |
| `POST` | `/items` | `{ name, sku, amount, price, category?, isInStock? }` | `201` | Create item |
| `PATCH` | `/items/:id` | any subset of fields | `200` | Partial update |
| `DELETE` | `/items/:id` | — | `204` | Delete item |

## Data model

### Item (active)

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

### InventoryItem (migrated, no API yet)

```prisma
model InventoryItem {
  id        String   @id @default(uuid())
  name      String
  amount    Int
  isInStock Boolean  @default(true)
  addedAt   DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

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
```
