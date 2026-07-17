-- AddMissingColumns: amount, price, isInStock, addedAt were in the schema but never migrated

ALTER TABLE "items" ADD COLUMN "amount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "items" ADD COLUMN "price" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "items" ADD COLUMN "isInStock" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "items" ADD COLUMN "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
