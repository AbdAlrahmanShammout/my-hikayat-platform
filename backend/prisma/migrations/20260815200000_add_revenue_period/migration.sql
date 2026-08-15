-- CreateEnum
CREATE TYPE "RevenuePeriodStatus" AS ENUM ('open', 'closed');

-- CreateTable
CREATE TABLE "RevenuePeriod" (
    "id" SERIAL NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "RevenuePeriodStatus" NOT NULL DEFAULT 'open',
    "platformCutPercent" DECIMAL(5,2) NOT NULL,
    "poolAmountCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RevenuePeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RevenuePeriod_startsAt_key" ON "RevenuePeriod"("startsAt");

-- CreateIndex
CREATE INDEX "RevenuePeriod_status_idx" ON "RevenuePeriod"("status");

-- CreateIndex
CREATE INDEX "RevenuePeriod_deletedAt_idx" ON "RevenuePeriod"("deletedAt");
