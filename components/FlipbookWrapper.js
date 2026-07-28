'use client'

import dynamic from 'next/dynamic'

const FlipbookViewer = dynamic(() => import('./FlipbookViewer'), { ssr: false })

export default function FlipbookWrapper({
  pdfUrl,
  title,
  issueId,
  isSubscribed = true,
  previewLimit = 4,
  publicationSlug,
}) {
  return (
    <FlipbookViewer
      pdfUrl={pdfUrl}
      title={title}
      issueId={issueId}
      isSubscribed={isSubscribed}
      previewLimit={previewLimit}
      publicationSlug={publicationSlug}
    />
  )
}