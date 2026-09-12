-- AlterTable
ALTER TABLE "User" ADD COLUMN "displayName" TEXT;

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN "description" TEXT;
ALTER TABLE "Collection" ADD COLUMN "accentColor" TEXT;

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSetting_key_key" ON "PlatformSetting"("key");

-- CreateIndex
CREATE INDEX "PlatformSetting_deletedAt_idx" ON "PlatformSetting"("deletedAt");
