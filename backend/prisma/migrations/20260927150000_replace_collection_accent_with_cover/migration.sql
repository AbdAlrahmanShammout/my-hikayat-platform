-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "accentColor";
ALTER TABLE "Collection" ADD COLUMN "coverStorageKey" TEXT;
ALTER TABLE "Collection" ADD COLUMN "coverContentType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Collection_coverStorageKey_key" ON "Collection"("coverStorageKey");
