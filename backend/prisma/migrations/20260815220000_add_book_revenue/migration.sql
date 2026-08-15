-- CreateTable
CREATE TABLE "BookRevenue" (
    "id" SERIAL NOT NULL,
    "revenuePeriodId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "weightedEngagement" DECIMAL(20,8) NOT NULL,
    "poolShareCents" INTEGER NOT NULL,
    "platformCutCents" INTEGER NOT NULL,
    "authorCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BookRevenue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookRevenue_revenuePeriodId_bookId_key" ON "BookRevenue"("revenuePeriodId", "bookId");

-- CreateIndex
CREATE INDEX "BookRevenue_revenuePeriodId_idx" ON "BookRevenue"("revenuePeriodId");

-- CreateIndex
CREATE INDEX "BookRevenue_bookId_idx" ON "BookRevenue"("bookId");

-- CreateIndex
CREATE INDEX "BookRevenue_ownerId_idx" ON "BookRevenue"("ownerId");

-- CreateIndex
CREATE INDEX "BookRevenue_deletedAt_idx" ON "BookRevenue"("deletedAt");

-- AddForeignKey
ALTER TABLE "BookRevenue" ADD CONSTRAINT "BookRevenue_revenuePeriodId_fkey" FOREIGN KEY ("revenuePeriodId") REFERENCES "RevenuePeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookRevenue" ADD CONSTRAINT "BookRevenue_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookRevenue" ADD CONSTRAINT "BookRevenue_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
