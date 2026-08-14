-- CreateTable
CREATE TABLE "BookPageTextLayer" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "contentText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BookPageTextLayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookPageTextRun" (
    "id" SERIAL NOT NULL,
    "textLayerId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BookPageTextRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookPageTextLayer_pageId_key" ON "BookPageTextLayer"("pageId");

-- CreateIndex
CREATE INDEX "BookPageTextLayer_bookId_idx" ON "BookPageTextLayer"("bookId");

-- CreateIndex
CREATE INDEX "BookPageTextRun_textLayerId_idx" ON "BookPageTextRun"("textLayerId");

-- CreateIndex
CREATE INDEX "BookPageTextRun_textLayerId_sortOrder_idx" ON "BookPageTextRun"("textLayerId", "sortOrder");

-- AddForeignKey
ALTER TABLE "BookPageTextLayer" ADD CONSTRAINT "BookPageTextLayer_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "BookPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookPageTextLayer" ADD CONSTRAINT "BookPageTextLayer_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookPageTextRun" ADD CONSTRAINT "BookPageTextRun_textLayerId_fkey" FOREIGN KEY ("textLayerId") REFERENCES "BookPageTextLayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
