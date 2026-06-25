'use client'

import { useState, useRef, useEffect } from 'react'
import HTMLFlipBook from 'react-pageflip'

export default function FlipbookViewer({ pdfUrl, title }) {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const flipBook = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    async function loadPDF() {
      try {
        if (!pdfUrl) {
          setError('No PDF found for this issue.')
          setLoading(false)
          return
        }
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        const pdf = await pdfjsLib.getDocument({ url: pdfUrl }).promise
        const numPages = pdf.numPages
        setTotalPages(numPages)
        setLoadingProgress({ current: 0, total: numPages })

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: 1.5 })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

          setPages(prev => [...prev, dataUrl])
          setLoadingProgress({ current: i, total: numPages })

          if (i === 1) setLoading(false) 
        }
      } catch (err) {
        console.error('PDF load error:', err)
        setError('Failed to load publication. Please try again.')
        setLoading(false)
      }
    }
    loadPDF()
  }, [pdfUrl])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 text-sm">
          {loadingProgress.total > 0
            ? `Loading page ${loadingProgress.current} of ${loadingProgress.total}...`
            : 'Loading publication...'}
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center gap-6 ${isFullscreen ? 'bg-gray-900 min-h-screen justify-center p-8' : ''}`}
    >
      <div className="flex items-center gap-3 bg-white rounded-full shadow-md px-6 py-2">
        <button
          onClick={() => flipBook.current?.pageFlip().flipPrev()}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 text-xl"
          title="Previous page"
        >
          ‹
        </button>
        <span className="text-sm text-gray-600 min-w-[80px] text-center font-medium">
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => flipBook.current?.pageFlip().flipNext()}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 text-xl"
          title="Next page"
        >
          ›
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 text-sm"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? '✕' : '⛶'}
        </button>
      </div>

      {loadingProgress.current < loadingProgress.total && (
        <div className="w-64">
          <div className="bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">
            Loading page {loadingProgress.current} of {loadingProgress.total}
          </p>
        </div>
      )}

      <HTMLFlipBook
        ref={flipBook}
        width={420}
        height={594}
        size="fixed"
        showCover={true}
        mobileScrollSupport={true}
        onFlip={(e) => setCurrentPage(e.data)}
        className="shadow-2xl"
      >
        {pages.map((src, i) => (
          <div key={i} style={{ background: '#fff' }}>
            <img src={src} alt={`Page ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        ))}
      </HTMLFlipBook>

      <p className="text-xs text-gray-400">
        Click pages or use arrows to navigate · Swipe on mobile
      </p>
    </div>
  )
}