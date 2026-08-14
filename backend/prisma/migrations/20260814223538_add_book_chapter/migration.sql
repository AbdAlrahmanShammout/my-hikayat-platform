-- CreateTable
CREATE TABLE "BookChapter" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "spineIndex" INTEGER NOT NULL,
    "href" TEXT NOT NULL,
    "manifestId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BookChapter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookChapter_bookId_idx" ON "BookChapter"("bookId");

-- CreateIndex
CREATE INDEX "BookChapter_bookId_spineIndex_idx" ON "BookChapter"("bookId", "spineIndex");

-- AddForeignKey
ALTER TABLE "BookChapter" ADD CONSTRAINT "BookChapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
