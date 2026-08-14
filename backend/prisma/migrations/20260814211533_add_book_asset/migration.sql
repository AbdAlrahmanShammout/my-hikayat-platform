-- CreateEnum
CREATE TYPE "BookAssetKind" AS ENUM ('source', 'processed', 'preview_image', 'promo_video', 'audio');

-- CreateTable
CREATE TABLE "BookAsset" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "kind" "BookAssetKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "checksumSha256" TEXT,
    "originalFileName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BookAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookAsset_storageKey_key" ON "BookAsset"("storageKey");

-- CreateIndex
CREATE INDEX "BookAsset_bookId_idx" ON "BookAsset"("bookId");

-- CreateIndex
CREATE INDEX "BookAsset_bookId_kind_idx" ON "BookAsset"("bookId", "kind");

-- AddForeignKey
ALTER TABLE "BookAsset" ADD CONSTRAINT "BookAsset_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
