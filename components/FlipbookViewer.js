'use client'

import { useState, useRef, useEffect } from 'react'
import HTMLFlipBook from 'react-pageflip'

export default function FlipbookViewer({ pdfUrl, title, issueId }) {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 })
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [dimensions, setDimensions] = useState({ width: 550, height: 778 })
  const [isMobile, setIsMobile] = useState(false)
  const flipBook = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    function computeSize() {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const isFs = !!document.fullscreenElement
      const mobile = vw < 768
      setIsMobile(mobile)

      const availWidth = vw - 24
      const availHeight = (isFs ? vh - 40 : vh - 130) 

      const ratio = 1.414

      let pageWidth = mobile
        ? Math.min(availWidth, 500)
        : Math.min(availWidth / 2, 800)
      let pageHeight = pageWidth * ratio

      if (pageHeight > availHeight) {
        pageHeight = availHeight
        pageWidth = pageHeight / ratio
      }

      pageWidth = Math.max(pageWidth, mobile ? 240 : 300)
      pageHeight = Math.max(pageHeight, mobile ? 340 : 424)

      setDimensions({ width: Math.round(pageWidth), height: Math.round(pageHeight) })
    }

    computeSize()
    window.addEventListener('resize', computeSize)
    document.addEventListener('fullscreenchange', computeSize)
    return () => {
      window.removeEventListener('resize', computeSize)
      document.removeEventListener('fullscreenchange', computeSize)
    }
  }, [])

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
        setLoadingProgress({ current: 0, total: numPages })

        const collectedPages = []
        const RENDER_SCALE = 2.5

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale: RENDER_SCALE })
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9)

          collectedPages.push(dataUrl)
          setLoadingProgress({ current: i, total: numPages })

          if (i === 1) {
            setLoading(false)
            if (issueId) {
              fetch('/api/views', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ issueId }),
              }).catch(() => {})
            }
          }
        }

        setPages(collectedPages)

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

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'ArrowLeft') {
        flipBook.current?.pageFlip().flipPrev()
      } else if (e.key === 'ArrowRight') {
        flipBook.current?.pageFlip().flipNext()
      } else if (e.key === '+' || e.key === '=') {
        setZoom(z => Math.min(z + 0.25, 3))
      } else if (e.key === '-' || e.key === '_') {
        setZoom(z => Math.max(z - 0.25, 1))
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  function zoomIn() { setZoom(z => Math.min(z + 0.25, 3)) }
  function zoomOut() { setZoom(z => Math.max(z - 0.25, 1)) }
  function resetZoom() { setZoom(1) }

  const totalPages = pages.length

  if (loading && pages.length === 0) {
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
      className={`flex flex-col items-center ${isFullscreen ? 'bg-gray-900' : ''}`}
      style={{ minHeight: isFullscreen ? '100vh' : undefined, paddingBottom: '90px' }}
    >
      {loadingProgress.current < loadingProgress.total && (
        <div className="w-64 mt-4">
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

      <div
        className="flex items-center justify-center w-full"
        style={{
          overflow: zoom > 1 ? 'auto' : 'visible',
          maxWidth: '100%',
          minHeight: isFullscreen ? '90vh' : '78vh',
        }}
      >
        <div
          style={{
            width: isMobile ? dimensions.width : dimensions.width * 2,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
          }}
        >
          <HTMLFlipBook
            key={`${dimensions.width}x${dimensions.height}-${isMobile}`}
            ref={flipBook}
            width={dimensions.width}
            height={dimensions.height}
            size="fixed"
            usePortrait={isMobile}
            showCover={true}
            drawShadow={true}
            flippingTime={600}
            startPage={0}
            mobileScrollSupport={true}
            onFlip={(e) => setCurrentPage(e.data)}
            className="shadow-2xl"
          >
            {pages.map((src, i) => (
              <div key={i} style={{ background: '#fff', width: '100%', height: '100%' }}>
                <img
                  src={src}
                  alt={`Page ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
            ))}
          </HTMLFlipBook>
        </div>
      </div>
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 sm:gap-3 bg-white rounded-full shadow-xl px-3 sm:px-6 py-1.5 sm:py-2 border border-gray-100 max-w-[95vw] overflow-x-auto">
        <button
          onClick={() => flipBook.current?.pageFlip().flipPrev()}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 text-xl shrink-0"
          title="Previous page"
        >
          ‹
        </button>
        <span className="text-xs sm:text-sm text-gray-600 min-w-[70px] sm:min-w-[100px] text-center font-medium shrink-0">
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => flipBook.current?.pageFlip().flipNext()}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-700 text-xl shrink-0"
          title="Next page"
        >
          ›
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1 shrink-0 hidden sm:block" />
        <button
          onClick={zoomOut}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 text-sm shrink-0 hidden sm:inline-flex"
          title="Zoom out"
          disabled={zoom <= 1}
        >
          −
        </button>
        <span className="text-xs text-gray-500 min-w-[36px] text-center shrink-0 hidden sm:inline-block">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 text-sm shrink-0 hidden sm:inline-flex"
          title="Zoom in"
          disabled={zoom >= 3}
        >
          +
        </button>
        {zoom !== 1 && (
          <button
            onClick={resetZoom}
            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 text-xs shrink-0 hidden sm:inline-flex"
            title="Reset zoom"
          >
            ⟲
          </button>
        )}
        <div className="w-px h-5 bg-gray-200 mx-1 shrink-0" />
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 text-sm shrink-0"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? '✕' : '⛶'}
        </button>
      </div>
    </div>
  )
}