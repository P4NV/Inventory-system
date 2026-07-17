-- AlterTable: rename title -> name, add sku, add updatedAt, remove done and createdAt

-- 1. Add new columns with defaults for existing rows
ALTER TABLE "items" ADD COLUMN "name" TEXT;
ALTER TABLE "items" ADD COLUMN "sku" TEXT;
ALTER TABLE "items" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Copy title -> name
UPDATE "items" SET "name" = "title";

-- 3. Generate SKU for existing rows
UPDATE "items" SET "sku" = 'ITEM-' || SUBSTR("id", 1, 8);

-- 4. Make columns NOT NULL now that data is populated
ALTER TABLE "items" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "items" ALTER COLUMN "sku" SET NOT NULL;

-- 5. Drop old columns
ALTER TABLE "items" DROP COLUMN "done";
ALTER TABLE "items" DROP COLUMN "createdAt";
ALTER TABLE "items" DROP COLUMN "title";

-- 6. Add unique constraint on sku
CREATE UNIQUE INDEX "items_sku_key" ON "items"("sku");
