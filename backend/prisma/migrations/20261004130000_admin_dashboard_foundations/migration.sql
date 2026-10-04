-- CreateExtension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- AlterEnum
ALTER TYPE "AdminInvitationStatus" ADD VALUE 'revoked';

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'invitation_created';
ALTER TYPE "AuditAction" ADD VALUE 'invitation_resent';
ALTER TYPE "AuditAction" ADD VALUE 'invitation_revoked';
ALTER TYPE "AuditAction" ADD VALUE 'export_requested';

-- AlterEnum
ALTER TYPE "AuditSubjectType" ADD VALUE 'invitation';
ALTER TYPE "AuditSubjectType" ADD VALUE 'admin_export';

-- CreateEnum
CREATE TYPE "AdminExportStatus" AS ENUM ('pending', 'processing', 'ready', 'failed', 'expired');

-- AlterTable
ALTER TABLE "AdminInvitation" ADD COLUMN "lastSentAt" TIMESTAMP(3),
ADD COLUMN "resendCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "revokedAt" TIMESTAMP(3),
ADD COLUMN "revokedByUserId" INTEGER,
ADD COLUMN "revokeReason" TEXT;

-- CreateIndex
CREATE INDEX "AdminInvitation_revokedByUserId_idx" ON "AdminInvitation"("revokedByUserId");

-- AddForeignKey
ALTER TABLE "AdminInvitation" ADD CONSTRAINT "AdminInvitation_revokedByUserId_fkey" FOREIGN KEY ("revokedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "AdminExport" (
    "id" SERIAL NOT NULL,
    "actorUserId" INTEGER NOT NULL,
    "resource" TEXT NOT NULL,
    "filters" JSONB NOT NULL,
    "columns" JSONB NOT NULL,
    "selectedIds" JSONB,
    "sortBy" TEXT,
    "sortOrder" TEXT,
    "status" "AdminExportStatus" NOT NULL DEFAULT 'pending',
    "storageKey" TEXT,
    "rowCount" INTEGER,
    "errorCode" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AdminExport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminExport_status_createdAt_idx" ON "AdminExport"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AdminExport_actorUserId_createdAt_idx" ON "AdminExport"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "AdminExport" ADD CONSTRAINT "AdminExport_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Book_bookType_idx" ON "Book"("bookType");

-- CreateIndex
CREATE INDEX "Book_layoutType_idx" ON "Book"("layoutType");

-- CreateIndex
CREATE INDEX "Book_title_trgm_idx" ON "Book" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Book_description_trgm_idx" ON "Book" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "BookSourceMetadata_creator_trgm_idx" ON "BookSourceMetadata" USING GIN ("creator" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "BookSourceMetadata_publisher_trgm_idx" ON "BookSourceMetadata" USING GIN ("publisher" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "User_email_trgm_idx" ON "User" USING GIN ("email" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "User_displayName_trgm_idx" ON "User" USING GIN ("displayName" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Category_name_trgm_idx" ON "Category" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Category_slug_trgm_idx" ON "Category" USING GIN ("slug" gin_trgm_ops);
