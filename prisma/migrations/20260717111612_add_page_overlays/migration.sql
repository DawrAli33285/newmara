-- CreateTable
CREATE TABLE "PageOverlay" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageOverlay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageOverlay_issueId_pageNumber_idx" ON "PageOverlay"("issueId", "pageNumber");

-- AddForeignKey
ALTER TABLE "PageOverlay" ADD CONSTRAINT "PageOverlay_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;
