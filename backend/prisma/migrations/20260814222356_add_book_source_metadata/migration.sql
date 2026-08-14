-- CreateTable
CREATE TABLE "BookSourceMetadata" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "packagePath" TEXT NOT NULL,
    "epubVersion" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "creator" TEXT,
    "publisher" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BookSourceMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookSourceMetadata_bookId_key" ON "BookSourceMetadata"("bookId");

-- AddForeignKey
ALTER TABLE "BookSourceMetadata" ADD CONSTRAINT "BookSourceMetadata_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
