-- CreateTable
CREATE TABLE "DirectoryListingEdit" (
    "id" TEXT NOT NULL,
    "directoryListingId" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "DirectoryListingEdit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DirectoryListingEdit_directoryListingId_status_idx" ON "DirectoryListingEdit"("directoryListingId", "status");

-- AddForeignKey
ALTER TABLE "DirectoryListingEdit" ADD CONSTRAINT "DirectoryListingEdit_directoryListingId_fkey" FOREIGN KEY ("directoryListingId") REFERENCES "DirectoryListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
