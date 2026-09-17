/*
  Warnings:

  - You are about to drop the `AdPageRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PageOverlay` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AdPageRequest" DROP CONSTRAINT "AdPageRequest_advertiserId_fkey";

-- DropForeignKey
ALTER TABLE "AdPageRequest" DROP CONSTRAINT "AdPageRequest_issueId_fkey";

-- DropForeignKey
ALTER TABLE "AdPageRequest" DROP CONSTRAINT "AdPageRequest_publicationId_fkey";

-- DropForeignKey
ALTER TABLE "AdPageRequest" DROP CONSTRAINT "AdPageRequest_resultingOverlayId_fkey";

-- DropForeignKey
ALTER TABLE "PageOverlay" DROP CONSTRAINT "PageOverlay_issueId_fkey";

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "pdfVersions" JSONB DEFAULT '[]',
ADD COLUMN     "totalPages" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "PrintBooking" ADD COLUMN     "adSize" TEXT,
ADD COLUMN     "artworkFileName" TEXT,
ADD COLUMN     "artworkFileType" TEXT,
ADD COLUMN     "artworkStatus" TEXT NOT NULL DEFAULT 'awaiting_artwork',
ADD COLUMN     "artworkUrl" TEXT,
ADD COLUMN     "issueId" TEXT,
ADD COLUMN     "pageNumber" INTEGER,
ADD COLUMN     "pageSpan" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "position" TEXT;

-- DropTable
DROP TABLE "AdPageRequest";

-- DropTable
DROP TABLE "PageOverlay";

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "pdfFileName" TEXT,
    "linkType" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "label" TEXT,
    "priceCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdUnlock" (
    "id" TEXT NOT NULL,
    "adId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "stripePaymentIntentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdUnlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ad_advertiserId_status_idx" ON "Ad"("advertiserId", "status");

-- CreateIndex
CREATE INDEX "Ad_publicationId_status_idx" ON "Ad"("publicationId", "status");

-- CreateIndex
CREATE INDEX "AdUnlock_userId_idx" ON "AdUnlock"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdUnlock_adId_userId_key" ON "AdUnlock"("adId", "userId");

-- CreateIndex
CREATE INDEX "PrintBooking_issueId_pageNumber_idx" ON "PrintBooking"("issueId", "pageNumber");

-- AddForeignKey
ALTER TABLE "PrintBooking" ADD CONSTRAINT "PrintBooking_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ad" ADD CONSTRAINT "Ad_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdUnlock" ADD CONSTRAINT "AdUnlock_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdUnlock" ADD CONSTRAINT "AdUnlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
