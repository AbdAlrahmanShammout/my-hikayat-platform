-- CreateTable
CREATE TABLE "BookEngagement" (
    "id" SERIAL NOT NULL,
    "revenuePeriodId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "layoutType" "BookLayoutType" NOT NULL,
    "activeReadingMs" INTEGER NOT NULL DEFAULT 0,
    "activeSpreadMs" INTEGER NOT NULL DEFAULT 0,
    "visualSceneTimeMs" INTEGER NOT NULL DEFAULT 0,
    "categoryWeight" DECIMAL(10,4) NOT NULL,
    "weightedEngagement" DECIMAL(20,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BookEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookEngagement_revenuePeriodId_bookId_key" ON "BookEngagement"("revenuePeriodId", "bookId");

-- CreateIndex
CREATE INDEX "BookEngagement_revenuePeriodId_idx" ON "BookEngagement"("revenuePeriodId");

-- CreateIndex
CREATE INDEX "BookEngagement_bookId_idx" ON "BookEngagement"("bookId");

-- CreateIndex
CREATE INDEX "BookEngagement_deletedAt_idx" ON "BookEngagement"("deletedAt");

-- AddForeignKey
ALTER TABLE "BookEngagement" ADD CONSTRAINT "BookEngagement_revenuePeriodId_fkey" FOREIGN KEY ("revenuePeriodId") REFERENCES "RevenuePeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookEngagement" ADD CONSTRAINT "BookEngagement_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
