'use client'

import dynamic from 'next/dynamic'

const FlipbookViewer = dynamic(() => import('./FlipbookViewer'), { ssr: false })

export default function FlipbookWrapper({ pdfUrl, title }) {
  return <FlipbookViewer pdfUrl={pdfUrl} title={title} />
}