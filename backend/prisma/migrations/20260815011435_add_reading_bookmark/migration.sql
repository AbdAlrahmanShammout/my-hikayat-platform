-- CreateTable
CREATE TABLE "ReadingBookmark" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "layoutType" "BookLayoutType" NOT NULL,
    "spineIndex" INTEGER,
    "scrollOffset" INTEGER,
    "spreadIndex" INTEGER,
    "pageNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ReadingBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReadingBookmark_userId_idx" ON "ReadingBookmark"("userId");

-- CreateIndex
CREATE INDEX "ReadingBookmark_bookId_idx" ON "ReadingBookmark"("bookId");

-- CreateIndex
CREATE INDEX "ReadingBookmark_userId_bookId_idx" ON "ReadingBookmark"("userId", "bookId");

-- AddForeignKey
ALTER TABLE "ReadingBookmark" ADD CONSTRAINT "ReadingBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadingBookmark" ADD CONSTRAINT "ReadingBookmark_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
