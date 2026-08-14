-- CreateEnum
CREATE TYPE "BookProcessingStatus" AS ENUM ('not_started', 'processing', 'ready', 'failed');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "processingStatus" "BookProcessingStatus" NOT NULL DEFAULT 'not_started';

-- CreateIndex
CREATE INDEX "Book_processingStatus_idx" ON "Book"("processingStatus");
