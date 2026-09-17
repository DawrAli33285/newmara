/*
  Warnings:

  - You are about to drop the column `packageId` on the `BusinessSubscription` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BusinessSubscription" DROP CONSTRAINT "BusinessSubscription_packageId_fkey";

-- AlterTable
ALTER TABLE "BusinessSubscription" DROP COLUMN "packageId",
ADD COLUMN     "digitalPackageId" TEXT,
ADD COLUMN     "printPackageId" TEXT;

-- AddForeignKey
ALTER TABLE "BusinessSubscription" ADD CONSTRAINT "BusinessSubscription_digitalPackageId_fkey" FOREIGN KEY ("digitalPackageId") REFERENCES "DigitalPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessSubscription" ADD CONSTRAINT "BusinessSubscription_printPackageId_fkey" FOREIGN KEY ("printPackageId") REFERENCES "PrintPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
