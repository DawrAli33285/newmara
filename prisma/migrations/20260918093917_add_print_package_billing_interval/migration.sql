-- AlterTable
ALTER TABLE "Destination" ADD COLUMN     "mainSponsorId" TEXT;

-- AlterTable
ALTER TABLE "PrintPackage" ADD COLUMN     "billingInterval" TEXT;

-- CreateIndex
CREATE INDEX "Destination_mainSponsorId_idx" ON "Destination"("mainSponsorId");

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_mainSponsorId_fkey" FOREIGN KEY ("mainSponsorId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
