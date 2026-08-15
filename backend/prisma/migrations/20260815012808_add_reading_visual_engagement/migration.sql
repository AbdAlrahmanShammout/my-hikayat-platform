-- CreateTable
CREATE TABLE "ReadingVisualEngagement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "layoutType" "BookLayoutType" NOT NULL,
    "spreadIndex" INTEGER NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "activeDurationMs" INTEGER NOT NULL DEFAULT 0,
    "visualSceneTimeMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ReadingVisualEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadingVisualEngagement_sessionId_idx" ON "ReadingVisualEngagement"("sessionId");

-- CreateIndex
CREATE INDEX "ReadingVisualEngagement_userId_bookId_idx" ON "ReadingVisualEngagement"("userId", "bookId");

-- CreateIndex
CREATE INDEX "ReadingVisualEngagement_bookId_idx" ON "ReadingVisualEngagement"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingVisualEngagement_sessionId_spreadIndex_pageNumber_key" ON "ReadingVisualEngagement"("sessionId", "spreadIndex", "pageNumber");

-- AddForeignKey
ALTER TABLE "ReadingVisualEngagement" ADD CONSTRAINT "ReadingVisualEngagement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingVisualEngagement" ADD CONSTRAINT "ReadingVisualEngagement_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingVisualEngagement" ADD CONSTRAINT "ReadingVisualEngagement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ReadingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
