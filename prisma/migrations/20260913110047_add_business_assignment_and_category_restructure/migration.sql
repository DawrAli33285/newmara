/*
  Warnings:

  - You are about to drop the column `category` on the `Business` table. All the data in the column will be lost.
  - You are about to drop the column `destinationId` on the `BusinessProfile` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `DirectoryListing` table. All the data in the column will be lost.
  - You are about to drop the column `destinationId` on the `DirectoryListing` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `Offer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BusinessProfile" DROP CONSTRAINT "BusinessProfile_destinationId_fkey";

-- DropForeignKey
ALTER TABLE "DirectoryListing" DROP CONSTRAINT "DirectoryListing_destinationId_fkey";

-- DropIndex
DROP INDEX "DirectoryListing_destinationId_idx";

-- DropIndex
DROP INDEX "DirectoryListing_publicationId_category_idx";

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "category";

-- AlterTable
ALTER TABLE "BusinessProfile" DROP COLUMN "destinationId";

-- AlterTable
ALTER TABLE "DirectoryListing" DROP COLUMN "category",
DROP COLUMN "destinationId";

-- AlterTable
ALTER TABLE "Offer" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT;

-- CreateTable
CREATE TABLE "BusinessAssignment" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "packageType" TEXT NOT NULL DEFAULT 'directory',
    "packageId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "BusinessAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BusinessAssignment_businessId_idx" ON "BusinessAssignment"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessAssignment_businessId_publicationId_destinationId_c_key" ON "BusinessAssignment"("businessId", "publicationId", "destinationId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "DirectoryListing_publicationId_idx" ON "DirectoryListing"("publicationId");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAssignment" ADD CONSTRAINT "BusinessAssignment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAssignment" ADD CONSTRAINT "BusinessAssignment_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAssignment" ADD CONSTRAINT "BusinessAssignment_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAssignment" ADD CONSTRAINT "BusinessAssignment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessAssignment" ADD CONSTRAINT "BusinessAssignment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "DigitalPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
