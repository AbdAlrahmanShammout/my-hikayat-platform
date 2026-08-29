-- AlterTable
ALTER TABLE "Plan" ADD COLUMN "description" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Plan" ADD COLUMN "stripePriceId" TEXT;
ALTER TABLE "Plan" ADD COLUMN "amountCents" INTEGER;
ALTER TABLE "Plan" ADD COLUMN "currency" TEXT;

-- DropIndex
DROP INDEX "Plan_kind_key";

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePriceId_key" ON "Plan"("stripePriceId");

-- CreateIndex
CREATE INDEX "Plan_kind_idx" ON "Plan"("kind");

-- Backfill seeded free and monthly plans for dynamic catalog support.
UPDATE "Plan"
SET
  "description" = 'Free tier without a credit card',
  "stripePriceId" = NULL,
  "amountCents" = NULL,
  "currency" = NULL
WHERE "slug" = 'free';

UPDATE "Plan"
SET
  "description" = 'Monthly paid full-book reading',
  "stripePriceId" = 'price_seed_monthly',
  "amountCents" = 999,
  "currency" = 'usd'
WHERE "slug" = 'monthly';
