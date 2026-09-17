/*
  Warnings:

  - You are about to drop the column `advertiserEmail` on the `AdvertiserPayment` table. All the data in the column will be lost.
  - You are about to drop the column `advertiserName` on the `AdvertiserPayment` table. All the data in the column will be lost.
  - Added the required column `advertiserId` to the `AdvertiserPayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AdvertiserPayment" DROP COLUMN "advertiserEmail",
DROP COLUMN "advertiserName",
ADD COLUMN     "advertiserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ghlContactId" TEXT;

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfile" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "location" TEXT,
    "mapUrl" TEXT,
    "website" TEXT,
    "telephone" TEXT,
    "socialLinks" JSONB,
    "galleryUrls" TEXT[],
    "promoVideoUrl" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "destinationId" TEXT,
    "ghlContactId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessProfileEdit" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "BusinessProfileEdit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER,
    "billingInterval" TEXT,
    "entitlements" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalPartner" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "paymentStatus" TEXT NOT NULL,
    "entitlementsUsed" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "renewalStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DigitalPartner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DigitalPartnerPublication" (
    "id" TEXT NOT NULL,
    "digitalPartnerId" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,

    CONSTRAINT "DigitalPartnerPublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintPackage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER,
    "entitlements" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrintBooking" (
    "id" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "packageId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrintBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "destinationId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "promoCode" TEXT,
    "category" TEXT,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "terms" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "submittedBy" TEXT,
    "approvedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectoryListing" (
    "id" TEXT NOT NULL,
    "businessId" TEXT,
    "publicationId" TEXT NOT NULL,
    "destinationId" TEXT,
    "businessName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "location" TEXT,
    "telephone" TEXT,
    "website" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedBy" TEXT,
    "approvedBy" TEXT,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DirectoryListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "businessProfileId" TEXT,
    "offerId" TEXT,
    "directoryListingId" TEXT,
    "publicationId" TEXT,
    "issueId" TEXT,
    "userId" TEXT,
    "campaignLinkId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EngagementEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "businessProfileId" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'received',
    "ghlContactId" TEXT,
    "ghlOpportunityId" TEXT,
    "forwardedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignLink" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "destinationUrl" TEXT NOT NULL,
    "publicationId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeaturedPlacement" (
    "id" TEXT NOT NULL,
    "placementType" TEXT NOT NULL,
    "businessProfileId" TEXT,
    "offerId" TEXT,
    "destinationId" TEXT,
    "publicationId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeaturedPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advertiser" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "advertiserName" TEXT NOT NULL,
    "telephone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertiser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Business_email_key" ON "Business"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessProfile_businessId_key" ON "BusinessProfile"("businessId");

-- CreateIndex
CREATE INDEX "BusinessProfileEdit_businessProfileId_status_idx" ON "BusinessProfileEdit"("businessProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalPackage_name_key" ON "DigitalPackage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalPartner_businessProfileId_key" ON "DigitalPartner"("businessProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "DigitalPartnerPublication_digitalPartnerId_publicationId_key" ON "DigitalPartnerPublication"("digitalPartnerId", "publicationId");

-- CreateIndex
CREATE UNIQUE INDEX "PrintPackage_name_key" ON "PrintPackage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PrintBooking_advertiserId_publicationId_startDate_key" ON "PrintBooking"("advertiserId", "publicationId", "startDate");

-- CreateIndex
CREATE INDEX "Destination_parentId_idx" ON "Destination"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_publicationId_slug_key" ON "Destination"("publicationId", "slug");

-- CreateIndex
CREATE INDEX "Offer_businessProfileId_status_idx" ON "Offer"("businessProfileId", "status");

-- CreateIndex
CREATE INDEX "Offer_expiryDate_idx" ON "Offer"("expiryDate");

-- CreateIndex
CREATE INDEX "DirectoryListing_publicationId_category_idx" ON "DirectoryListing"("publicationId", "category");

-- CreateIndex
CREATE INDEX "DirectoryListing_destinationId_idx" ON "DirectoryListing"("destinationId");

-- CreateIndex
CREATE INDEX "EngagementEvent_businessProfileId_eventType_createdAt_idx" ON "EngagementEvent"("businessProfileId", "eventType", "createdAt");

-- CreateIndex
CREATE INDEX "EngagementEvent_offerId_eventType_idx" ON "EngagementEvent"("offerId", "eventType");

-- CreateIndex
CREATE INDEX "EngagementEvent_directoryListingId_eventType_idx" ON "EngagementEvent"("directoryListingId", "eventType");

-- CreateIndex
CREATE INDEX "EngagementEvent_campaignLinkId_idx" ON "EngagementEvent"("campaignLinkId");

-- CreateIndex
CREATE INDEX "Enquiry_businessProfileId_status_idx" ON "Enquiry"("businessProfileId", "status");

-- CreateIndex
CREATE INDEX "Enquiry_ghlContactId_idx" ON "Enquiry"("ghlContactId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignLink_code_key" ON "CampaignLink"("code");

-- CreateIndex
CREATE INDEX "FeaturedPlacement_placementType_publicationId_idx" ON "FeaturedPlacement"("placementType", "publicationId");

-- CreateIndex
CREATE UNIQUE INDEX "Advertiser_businessId_key" ON "Advertiser"("businessId");

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfile" ADD CONSTRAINT "BusinessProfile_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessProfileEdit" ADD CONSTRAINT "BusinessProfileEdit_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalPartner" ADD CONSTRAINT "DigitalPartner_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalPartner" ADD CONSTRAINT "DigitalPartner_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "DigitalPackage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalPartnerPublication" ADD CONSTRAINT "DigitalPartnerPublication_digitalPartnerId_fkey" FOREIGN KEY ("digitalPartnerId") REFERENCES "DigitalPartner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DigitalPartnerPublication" ADD CONSTRAINT "DigitalPartnerPublication_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintBooking" ADD CONSTRAINT "PrintBooking_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintBooking" ADD CONSTRAINT "PrintBooking_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrintBooking" ADD CONSTRAINT "PrintBooking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "PrintPackage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertiserPayment" ADD CONSTRAINT "AdvertiserPayment_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryListing" ADD CONSTRAINT "DirectoryListing_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryListing" ADD CONSTRAINT "DirectoryListing_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectoryListing" ADD CONSTRAINT "DirectoryListing_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementEvent" ADD CONSTRAINT "EngagementEvent_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementEvent" ADD CONSTRAINT "EngagementEvent_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementEvent" ADD CONSTRAINT "EngagementEvent_directoryListingId_fkey" FOREIGN KEY ("directoryListingId") REFERENCES "DirectoryListing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementEvent" ADD CONSTRAINT "EngagementEvent_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementEvent" ADD CONSTRAINT "EngagementEvent_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementEvent" ADD CONSTRAINT "EngagementEvent_campaignLinkId_fkey" FOREIGN KEY ("campaignLinkId") REFERENCES "CampaignLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignLink" ADD CONSTRAINT "CampaignLink_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedPlacement" ADD CONSTRAINT "FeaturedPlacement_businessProfileId_fkey" FOREIGN KEY ("businessProfileId") REFERENCES "BusinessProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedPlacement" ADD CONSTRAINT "FeaturedPlacement_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedPlacement" ADD CONSTRAINT "FeaturedPlacement_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeaturedPlacement" ADD CONSTRAINT "FeaturedPlacement_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertiser" ADD CONSTRAINT "Advertiser_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
