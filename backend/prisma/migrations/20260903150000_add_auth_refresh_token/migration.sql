-- CreateTable
CREATE TABLE "AuthRefreshToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AuthRefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthRefreshToken_tokenHash_key" ON "AuthRefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AuthRefreshToken_userId_idx" ON "AuthRefreshToken"("userId");

-- CreateIndex
CREATE INDEX "AuthRefreshToken_expiresAt_idx" ON "AuthRefreshToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "AuthRefreshToken" ADD CONSTRAINT "AuthRefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
