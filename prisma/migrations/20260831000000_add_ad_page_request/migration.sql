CREATE TABLE "AdPageRequest" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "advertiserId" TEXT NOT NULL,
    "publicationId" TEXT NOT NULL,
    "pdfUrl" TEXT NOT NULL,
    "pdfFileName" TEXT,
    "linkType" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "insertPosition" TEXT NOT NULL,
    "relativeToPageNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "resultingOverlayId" TEXT,
    "resultingPageNumber" INTEGER,

    CONSTRAINT "AdPageRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdPageRequest_resultingOverlayId_key" ON "AdPageRequest"("resultingOverlayId");
CREATE INDEX "AdPageRequest_issueId_status_idx" ON "AdPageRequest"("issueId", "status");
CREATE INDEX "AdPageRequest_advertiserId_status_idx" ON "AdPageRequest"("advertiserId", "status");

ALTER TABLE "AdPageRequest" ADD CONSTRAINT "AdPageRequest_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AdPageRequest" ADD CONSTRAINT "AdPageRequest_advertiserId_fkey" FOREIGN KEY ("advertiserId") REFERENCES "Advertiser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdPageRequest" ADD CONSTRAINT "AdPageRequest_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AdPageRequest" ADD CONSTRAINT "AdPageRequest_resultingOverlayId_fkey" FOREIGN KEY ("resultingOverlayId") REFERENCES "PageOverlay"("id") ON DELETE SET NULL ON UPDATE CASCADE;