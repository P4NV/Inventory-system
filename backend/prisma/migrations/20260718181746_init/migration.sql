/*
  Warnings:

  - You are about to drop the `InventoryItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "items" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "InventoryItem";
