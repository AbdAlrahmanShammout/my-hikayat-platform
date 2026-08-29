-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "trialStartedAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN "trialEndsAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Subscription_trialEndsAt_idx" ON "Subscription"("trialEndsAt");
