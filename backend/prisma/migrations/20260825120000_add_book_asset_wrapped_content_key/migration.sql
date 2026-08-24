-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'book_content_key_issued';

-- AlterTable
ALTER TABLE "BookAsset" ADD COLUMN "wrappedContentKey" BYTEA;
