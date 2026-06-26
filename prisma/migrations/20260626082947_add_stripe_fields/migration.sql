/*
  Warnings:

  - A unique constraint covering the columns `[userId,publicationId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AdvertiserPayment" ADD COLUMN     "paymentUrl" TEXT;

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "stripePriceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_publicationId_key" ON "Subscription"("userId", "publicationId");
