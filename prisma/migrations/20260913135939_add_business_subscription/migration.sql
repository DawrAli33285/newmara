-- CreateTable
CREATE TABLE "BusinessSubscription" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "packageType" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'incomplete',
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSubscription_stripeSubscriptionId_key" ON "BusinessSubscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "BusinessSubscription_businessId_idx" ON "BusinessSubscription"("businessId");

-- CreateIndex
CREATE INDEX "BusinessSubscription_stripeSubscriptionId_idx" ON "BusinessSubscription"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "BusinessSubscription" ADD CONSTRAINT "BusinessSubscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessSubscription" ADD CONSTRAINT "BusinessSubscription_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "DigitalPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
