'use client'

import dynamic from 'next/dynamic'

const AdFlipbookViewer = dynamic(() => import('./AdFlipbookViewer'), { ssr: false })

export default function AdFlipbookWrapper({
  pdfUrl,
  title,
  adId,
  linkUrl,
  linkType,
  linkLabel,
  pageNumber,
  isSubscribed = true,
  previewLimit = 4,
  publicationSlug,
}) {
  return (
    <AdFlipbookViewer
      pdfUrl={pdfUrl}
      title={title}
      adId={adId}
      linkUrl={linkUrl}
      linkType={linkType}
      linkLabel={linkLabel}
      pageNumber={pageNumber}
      isSubscribed={isSubscribed}
      previewLimit={previewLimit}
      publicationSlug={publicationSlug}
    />
  )
}