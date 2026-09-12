-- CreateTable
CREATE TABLE "OfflineDownload" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OfflineDownload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfflineDownload_userId_bookId_key" ON "OfflineDownload"("userId", "bookId");

-- CreateIndex
CREATE INDEX "OfflineDownload_userId_deletedAt_idx" ON "OfflineDownload"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX "OfflineDownload_bookId_idx" ON "OfflineDownload"("bookId");

-- AddForeignKey
ALTER TABLE "OfflineDownload" ADD CONSTRAINT "OfflineDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfflineDownload" ADD CONSTRAINT "OfflineDownload_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
