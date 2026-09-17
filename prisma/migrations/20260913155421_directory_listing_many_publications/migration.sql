/*
  Warnings:

  - You are about to drop the column `publicationId` on the `DirectoryListing` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DirectoryListing" DROP CONSTRAINT "DirectoryListing_publicationId_fkey";

-- DropIndex
DROP INDEX "DirectoryListing_publicationId_idx";

-- AlterTable
ALTER TABLE "DirectoryListing" DROP COLUMN "publicationId";

-- CreateTable
CREATE TABLE "_DirectoryListingToPublication" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DirectoryListingToPublication_AB_unique" ON "_DirectoryListingToPublication"("A", "B");

-- CreateIndex
CREATE INDEX "_DirectoryListingToPublication_B_index" ON "_DirectoryListingToPublication"("B");

-- AddForeignKey
ALTER TABLE "_DirectoryListingToPublication" ADD CONSTRAINT "_DirectoryListingToPublication_A_fkey" FOREIGN KEY ("A") REFERENCES "DirectoryListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DirectoryListingToPublication" ADD CONSTRAINT "_DirectoryListingToPublication_B_fkey" FOREIGN KEY ("B") REFERENCES "Publication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
