-- CreateTable
CREATE TABLE "ReadingChapterEngagement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "layoutType" "BookLayoutType" NOT NULL,
    "spineIndex" INTEGER NOT NULL,
    "activeDurationMs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ReadingChapterEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadingChapterEngagement_sessionId_idx" ON "ReadingChapterEngagement"("sessionId");

-- CreateIndex
CREATE INDEX "ReadingChapterEngagement_userId_bookId_idx" ON "ReadingChapterEngagement"("userId", "bookId");

-- CreateIndex
CREATE INDEX "ReadingChapterEngagement_bookId_idx" ON "ReadingChapterEngagement"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingChapterEngagement_sessionId_spineIndex_key" ON "ReadingChapterEngagement"("sessionId", "spineIndex");

-- AddForeignKey
ALTER TABLE "ReadingChapterEngagement" ADD CONSTRAINT "ReadingChapterEngagement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingChapterEngagement" ADD CONSTRAINT "ReadingChapterEngagement_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingChapterEngagement" ADD CONSTRAINT "ReadingChapterEngagement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ReadingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
