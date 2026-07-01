'use client'

import dynamic from 'next/dynamic'

const FlipbookViewer = dynamic(() => import('./FlipbookViewer'), { ssr: false })

export default function FlipbookWrapper({ pdfUrl, title, issueId }) {
  return <FlipbookViewer pdfUrl={pdfUrl} title={title} issueId={issueId} />
}