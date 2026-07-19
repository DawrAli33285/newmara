'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
export default function OverlayEditor({ issueId, pdfUrl }) {
  const [numPages, setNumPages] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageImage, setPageImage] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [overlays, setOverlays] = useState([])
  const [drawing, setDrawing] = useState(null) 
  const [pendingBox, setPendingBox] = useState(null) 
  const [form, setForm] = useState({ type: 'link', url: '', label: '' })
  const [saving, setSaving] = useState(false)
  const [currentPdfUrl, setCurrentPdfUrl] = useState(pdfUrl)
  const imgRef = useRef(null)
  const pdfDocRef = useRef(null)
  const [showInsertPanel, setShowInsertPanel] = useState(true)
  const [insertPdf, setInsertPdf] = useState(null)
  const [insertPosition, setInsertPosition] = useState('after') 
  const [inserting, setInserting] = useState(false)
  const [insertError, setInsertError] = useState('')
  useEffect(() => {
    async function init() {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
      const pdf = await pdfjsLib.getDocument({ url: currentPdfUrl }).promise
      pdfDocRef.current = pdf
      setNumPages(pdf.numPages)
    }
    init()
  }, [currentPdfUrl])

  useEffect(() => {
    async function renderPage() {
      if (!pdfDocRef.current) return
      setPageLoading(true)
      const page = await pdfDocRef.current.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 2 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
      setPageImage(canvas.toDataURL('image/jpeg', 0.9))
      setPageLoading(false)
    }
    if (numPages > 0) renderPage()
  }, [pageNumber, numPages])

  const fetchOverlays = useCallback(async () => {
    const res = await fetch(`/api/admin/issues/${issueId}/overlays`)
    if (res.ok) setOverlays(await res.json())
  }, [issueId])

  useEffect(() => { fetchOverlays() }, [fetchOverlays])

  const pageOverlays = overlays.filter((o) => o.pageNumber === pageNumber)

  function getFractionFromEvent(e) {
    const rect = imgRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    return { x: Math.min(Math.max(x, 0), 1), y: Math.min(Math.max(y, 0), 1) }
  }

  function handleMouseDown(e) {
    const { x, y } = getFractionFromEvent(e)
    setDrawing({ startX: x, startY: y, x, y, w: 0, h: 0 })
    setPendingBox(null)
  }

  function handleMouseMove(e) {
    if (!drawing) return
    const { x, y } = getFractionFromEvent(e)
    const newX = Math.min(drawing.startX, x)
    const newY = Math.min(drawing.startY, y)
    const w = Math.abs(x - drawing.startX)
    const h = Math.abs(y - drawing.startY)
    setDrawing({ ...drawing, x: newX, y: newY, w, h })
  }

  function handleMouseUp() {
    if (!drawing) return
    if (drawing.w < 0.02 || drawing.h < 0.02) {
      setDrawing(null)
      return
    }
    setPendingBox({ x: drawing.x, y: drawing.y, width: drawing.w, height: drawing.h })
    setDrawing(null)
    setForm({ type: 'link', url: '', label: '' })
  }

  async function saveOverlay() {
    if (!pendingBox || !form.url.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/issues/${issueId}/overlays`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageNumber,
          type: form.type,
          url: form.url.trim(),
          label: form.label.trim() || null,
          ...pendingBox,
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setPendingBox(null)
      setForm({ type: 'link', url: '', label: '' })
      await fetchOverlays()
    } catch (err) {
      console.error(err)
      alert('Failed to save overlay')
    } finally {
      setSaving(false)
    }
  }

  async function deleteOverlay(overlayId) {
    if (!confirm('Remove this overlay?')) return
    const res = await fetch(`/api/admin/overlays/${overlayId}`, { method: 'DELETE' })
    if (res.ok) await fetchOverlays()
  }

  async function handleInsertPage() {
    if (!insertPdf) {
      setInsertError('Choose a PDF first.')
      return
    }
    setInserting(true)
    setInsertError('')
    const afterPage = insertPosition === 'before' ? pageNumber - 1 : pageNumber

    const formData = new FormData()
    formData.append('pdf', insertPdf)
    formData.append('afterPage', String(afterPage))

    try {
      const res = await fetch(`/api/admin/issues/${issueId}/insert-page`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Insert failed')

      setShowInsertPanel(false)
      setInsertPdf(null)
      if (data.pdfUrl) setCurrentPdfUrl(data.pdfUrl)
      setPageNumber(data.newPageNumber) 
      await fetchOverlays() 
    } catch (err) {
      console.error(err)
      setInsertError(err.message || 'Failed to insert page')
    } finally {
      setInserting(false)
    }
  }

  const box = pendingBox || (drawing && drawing.w > 0 ? { x: drawing.x, y: drawing.y, width: drawing.w, height: drawing.h } : null)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Add PDF</h3>
        {numPages > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="px-2 py-1 rounded border border-gray-200 text-sm disabled:opacity-40"
            >
              ‹
            </button>
            <span className="text-sm text-gray-600 min-w-[80px] text-center">
              Page {pageNumber} / {numPages}
            </span>
            <button
              onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              className="px-2 py-1 rounded border border-gray-200 text-sm disabled:opacity-40"
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">
          Click and drag on the page to place a link or video hotspot. Existing hotspots are outlined in blue.
        </p>
        <button
          onClick={() => { setShowInsertPanel((v) => !v); setInsertError('') }}
          className="text-xs font-medium text-purple-600 hover:underline shrink-0 ml-4"
        >
          {showInsertPanel ? 'Hide add page' : '+ Add page'}
        </button>
      </div>

      {showInsertPanel && (
        <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">
            {numPages > 0 ? `Add a page ${insertPosition === 'before' ? 'before' : 'after'} page ${pageNumber}` : 'Add a page'}
          </p>
          <p className="text-xs text-gray-500 mb-3">
            Upload a PDF — its pages are merged into this issue at the chosen position. Once added, you can add link and video hotspots to them.
          </p>

          {numPages > 0 && (
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">Position</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setInsertPosition('before')}
                  className={`text-sm px-3 py-1.5 rounded-lg border ${insertPosition === 'before' ? 'bg-[#1C3664] text-white border-[#1C3664]' : 'border-gray-200 text-gray-600'}`}
                >
                  Before page {pageNumber}
                </button>
                <button
                  onClick={() => setInsertPosition('after')}
                  className={`text-sm px-3 py-1.5 rounded-lg border ${insertPosition === 'after' ? 'bg-[#1C3664] text-white border-[#1C3664]' : 'border-gray-200 text-gray-600'}`}
                >
                  After page {pageNumber}
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[220px]">
              <label className="text-xs text-gray-500 block mb-1">Page PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setInsertPdf(e.target.files[0] || null)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
              />
            </div>

            <button
              onClick={handleInsertPage}
              disabled={inserting || !insertPdf}
              className="text-sm px-4 py-2 rounded-lg bg-[#1C3664] text-white hover:bg-blue-900 disabled:opacity-50 shrink-0"
            >
              {inserting ? 'Merging…' : 'Add PDF'}
            </button>
          </div>

          {insertError && (
            <p className="text-red-600 text-xs mt-2">{insertError}</p>
          )}
        </div>
      )}

      <div className="flex gap-6 flex-wrap">
        <div
          className="relative border border-gray-200 rounded-lg overflow-hidden select-none shrink-0"
          style={{ width: 380, cursor: 'crosshair' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => drawing && handleMouseUp()}
        >
          {pageLoading || !pageImage ? (
            <div className="h-[537px] flex items-center justify-center text-gray-400 text-sm">
              Loading page…
            </div>
          ) : (
            <img ref={imgRef} src={pageImage} alt={`Page ${pageNumber}`} className="w-full block pointer-events-none" draggable={false} />
          )}

          {pageOverlays.map((o) => (
            <div
              key={o.id}
              className="absolute border-2 border-blue-500 bg-blue-500/10 group"
              style={{
                left: `${o.x * 100}%`,
                top: `${o.y * 100}%`,
                width: `${o.width * 100}%`,
                height: `${o.height * 100}%`,
              }}
            >
              <span className="absolute -top-5 left-0 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded whitespace-nowrap">
                {o.type === 'video' ? '▶ Video' : '🔗 Link'}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteOverlay(o.id) }}
                className="absolute -top-5 right-0 text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            </div>
          ))}

          {box && (
            <div
              className="absolute border-2 border-dashed border-green-500 bg-green-500/10 pointer-events-none"
              style={{
                left: `${box.x * 100}%`,
                top: `${box.y * 100}%`,
                width: `${box.width * 100}%`,
                height: `${box.height * 100}%`,
              }}
            />
          )}
        </div>

        <div className="flex-1 min-w-[240px]">
          {pendingBox ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">New hotspot on page {pageNumber}</p>

              <div>
                <label className="text-xs text-gray-500">Type</label>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setForm((f) => ({ ...f, type: 'link' }))}
                    className={`flex-1 text-sm py-1.5 rounded-lg border ${form.type === 'link' ? 'bg-[#1C3664] text-white border-[#1C3664]' : 'border-gray-200 text-gray-600'}`}
                  >
                    🔗 Link
                  </button>
                  <button
                    onClick={() => setForm((f) => ({ ...f, type: 'video' }))}
                    className={`flex-1 text-sm py-1.5 rounded-lg border ${form.type === 'video' ? 'bg-[#1C3664] text-white border-[#1C3664]' : 'border-gray-200 text-gray-600'}`}
                  >
                    ▶ Video
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">
                  {form.type === 'video' ? 'Video URL (YouTube, Vimeo, or .mp4)' : 'Link URL'}
                </label>
                <input
                  type="text"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder={form.type === 'video' ? 'https://youtube.com/watch?v=...' : 'https://example.com'}
                  className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Label (optional tooltip)</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="e.g. Watch our story"
                  className="w-full mt-1 text-sm border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setPendingBox(null)}
                  className="flex-1 text-sm py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveOverlay}
                  disabled={saving || !form.url.trim()}
                  className="flex-1 text-sm py-2 rounded-lg bg-[#1C3664] text-white hover:bg-blue-900 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save hotspot'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">
                Hotspots on this page ({pageOverlays.length})
              </p>
              {pageOverlays.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Drag on the page image to add a link or video here.
                </p>
              ) : (
                <ul className="space-y-2">
                  {pageOverlays.map((o) => (
                    <li key={o.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800">
                          {o.type === 'video' ? '▶ Video' : '🔗 Link'} {o.label && `— ${o.label}`}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{o.url}</p>
                      </div>
                      <button
                        onClick={() => deleteOverlay(o.id)}
                        className="text-xs text-red-600 hover:underline ml-3 shrink-0"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}