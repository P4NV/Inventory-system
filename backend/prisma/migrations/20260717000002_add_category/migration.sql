-- Add category column with a default for existing rows
ALTER TABLE "items" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'general';
