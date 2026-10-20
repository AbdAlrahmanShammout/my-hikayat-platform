-- CreateEnum
CREATE TYPE "ReadingCompletionStatus" AS ENUM ('in_progress', 'completed');

-- CreateTable
CREATE TABLE "BookReadingCycle" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "status" "ReadingCompletionStatus" NOT NULL DEFAULT 'in_progress',
    "layoutType" "BookLayoutType" NOT NULL,
    "lastPageRead" INTEGER,
    "activeTimeMs" INTEGER NOT NULL DEFAULT 0,
    "qualifyingPageCount" INTEGER NOT NULL DEFAULT 0,
    "lastPageReached" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BookReadingCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookReadingCyclePage" (
    "id" SERIAL NOT NULL,
    "cycleId" INTEGER NOT NULL,
    "pageIndex" INTEGER NOT NULL,
    "activeDurationMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BookReadingCyclePage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookReadingCycle_userId_bookId_cycleNumber_key" ON "BookReadingCycle"("userId", "bookId", "cycleNumber");

-- CreateIndex
CREATE INDEX "BookReadingCycle_userId_bookId_idx" ON "BookReadingCycle"("userId", "bookId");

-- CreateIndex
CREATE INDEX "BookReadingCycle_bookId_status_completedAt_idx" ON "BookReadingCycle"("bookId", "status", "completedAt");

-- CreateIndex
CREATE INDEX "BookReadingCycle_deletedAt_idx" ON "BookReadingCycle"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BookReadingCyclePage_cycleId_pageIndex_key" ON "BookReadingCyclePage"("cycleId", "pageIndex");

-- CreateIndex
CREATE INDEX "BookReadingCyclePage_cycleId_idx" ON "BookReadingCyclePage"("cycleId");

-- AddForeignKey
ALTER TABLE "BookReadingCycle" ADD CONSTRAINT "BookReadingCycle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookReadingCycle" ADD CONSTRAINT "BookReadingCycle_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookReadingCyclePage" ADD CONSTRAINT "BookReadingCyclePage_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "BookReadingCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
