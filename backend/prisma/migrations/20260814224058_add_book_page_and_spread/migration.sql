-- CreateEnum
CREATE TYPE "BookPageSpreadRole" AS ENUM ('left', 'right', 'center', 'single');

-- CreateTable
CREATE TABLE "BookPage" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "spineIndex" INTEGER NOT NULL,
    "href" TEXT NOT NULL,
    "manifestId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "spreadRole" "BookPageSpreadRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BookPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookSpread" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "spreadIndex" INTEGER NOT NULL,
    "leftPageId" INTEGER,
    "rightPageId" INTEGER,
    "centerPageId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BookSpread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookPage_bookId_idx" ON "BookPage"("bookId");

-- CreateIndex
CREATE INDEX "BookPage_bookId_spineIndex_idx" ON "BookPage"("bookId", "spineIndex");

-- CreateIndex
CREATE INDEX "BookSpread_bookId_idx" ON "BookSpread"("bookId");

-- CreateIndex
CREATE INDEX "BookSpread_bookId_spreadIndex_idx" ON "BookSpread"("bookId", "spreadIndex");

-- AddForeignKey
ALTER TABLE "BookPage" ADD CONSTRAINT "BookPage_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookSpread" ADD CONSTRAINT "BookSpread_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookSpread" ADD CONSTRAINT "BookSpread_leftPageId_fkey" FOREIGN KEY ("leftPageId") REFERENCES "BookPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookSpread" ADD CONSTRAINT "BookSpread_rightPageId_fkey" FOREIGN KEY ("rightPageId") REFERENCES "BookPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookSpread" ADD CONSTRAINT "BookSpread_centerPageId_fkey" FOREIGN KEY ("centerPageId") REFERENCES "BookPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
