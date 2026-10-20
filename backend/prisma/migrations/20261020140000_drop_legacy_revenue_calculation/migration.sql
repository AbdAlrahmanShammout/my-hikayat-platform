DELETE FROM "BookRevenue";

UPDATE "RevenuePeriod" SET "poolAmountCents" = NULL;

ALTER TABLE "RevenuePeriod" DROP COLUMN "platformCutPercent";

ALTER TABLE "BookEngagement" DROP COLUMN "categoryWeight",
DROP COLUMN "weightedEngagement";

ALTER TABLE "BookRevenue" DROP COLUMN "weightedEngagement";

ALTER TABLE "BookRevenue" ADD COLUMN "completedReadCount" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "BookRevenue" ALTER COLUMN "completedReadCount" DROP DEFAULT;
