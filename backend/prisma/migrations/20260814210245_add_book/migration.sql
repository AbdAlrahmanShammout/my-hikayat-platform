-- CreateEnum
CREATE TYPE "BookLayoutType" AS ENUM ('reflowable', 'fixed_layout');

-- CreateEnum
CREATE TYPE "BookType" AS ENUM ('standard_chapter', 'picture_book', 'illustrated_chapter');

-- CreateEnum
CREATE TYPE "BookPublishingStatus" AS ENUM ('pending', 'in_review', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "layoutType" "BookLayoutType",
    "bookType" "BookType" NOT NULL,
    "publishingStatus" "BookPublishingStatus" NOT NULL DEFAULT 'pending',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BookToCategory" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BookToCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "Book_publishingStatus_idx" ON "Book"("publishingStatus");

-- CreateIndex
CREATE INDEX "Book_publishedAt_idx" ON "Book"("publishedAt");

-- CreateIndex
CREATE INDEX "_BookToCategory_B_index" ON "_BookToCategory"("B");

-- AddForeignKey
ALTER TABLE "_BookToCategory" ADD CONSTRAINT "_BookToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookToCategory" ADD CONSTRAINT "_BookToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
