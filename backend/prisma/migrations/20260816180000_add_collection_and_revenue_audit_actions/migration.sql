-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'collection_created';
ALTER TYPE "AuditAction" ADD VALUE 'collection_updated';
ALTER TYPE "AuditAction" ADD VALUE 'collection_deleted';
ALTER TYPE "AuditAction" ADD VALUE 'collection_book_added';
ALTER TYPE "AuditAction" ADD VALUE 'collection_book_removed';
ALTER TYPE "AuditAction" ADD VALUE 'collection_reordered';
ALTER TYPE "AuditAction" ADD VALUE 'revenue_calculated';
ALTER TYPE "AuditSubjectType" ADD VALUE 'collection';
ALTER TYPE "AuditSubjectType" ADD VALUE 'revenue_period';
