'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const STATUS_LABEL = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
}

const STATUS_COLOR = {
  pending: 'bg-amber-50 border-amber-200 text-amber-700',
  approved: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  rejected: 'bg-red-50 border-red-200 text-red-700',
}


function IssuePagePreview({ pdfUrl, pageNumber }) {
  const [pageImage, setPageImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const pdfDocRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function render() {
      if (!pdfUrl || !pageNumber) return
      setLoading(true)
      setError('')
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        if (!pdfDocRef.current) {
          pdfDocRef.current = await pdfjsLib.getDocument({ url: pdfUrl }).promise
        }

        const page = await pdfDocRef.current.getPage(pageNumber)
        const viewport = page.getViewport({ scale: 1.4 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise

        if (!cancelled) setPageImage(canvas.toDataURL('image/jpeg', 0.85))
      } catch (err) {
        if (!cancelled) setError('Could not load a preview of this page.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [pdfUrl, pageNumber])

  if (!pdfUrl || !pageNumber) return null

  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">
        Preview — page {pageNumber} as it is now
      </label>
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50" style={{ width: 220 }}>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center text-gray-400 text-xs">
            Loading page…
          </div>
        ) : error ? (
          <div className="h-[300px] flex items-center justify-center text-gray-400 text-xs px-3 text-center">
            {error}
          </div>
        ) : (
          <img src={pageImage} alt={`Page ${pageNumber} preview`} className="w-full block" draggable={false} />
        )}
      </div>
      <p className="text-[11px] text-gray-400 mt-1">
        Your page will be inserted {' '}
        <span className="font-medium text-gray-500">next to</span> this one — this is for reference only.
      </p>
    </div>
  )
}

export default function AdPageRequestForm({ issueId, totalPages, pdfUrl, allowsLink = true }) {

  const [requests, setRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [pdfFile, setPdfFile] = useState(null)
  const [linkType, setLinkType] = useState('link')
  const [linkUrl, setLinkUrl] = useState('')
  const [label, setLabel] = useState('')
  const [insertPosition, setInsertPosition] = useState('after')
  const [relativeToPageNumber, setRelativeToPageNumber] = useState(
    totalPages > 0 ? 1 : ''
  )

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true)
    setLoadError('')
    try {
      const res = await fetch(`/api/business/issues/${issueId}/ad-page-requests`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not load your requests.')
      setRequests(data.requests || [])
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoadingRequests(false)
    }
  }, [issueId])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  function resetForm() {
    setPdfFile(null)
    setLinkType('link')
    setLinkUrl('')
    setLabel('')
    setInsertPosition('after')
    setRelativeToPageNumber(totalPages > 0 ? 1 : '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    setSubmitted(false)

    if (!pdfFile) {
      setSubmitError('Choose a PDF for your ad page.')
      return
    }
    if (!linkUrl.trim()) {
      setSubmitError(
        linkType === 'video' ? 'Enter a video URL.' : 'Enter a link URL.'
      )
      return
    }
    if (totalPages > 0 && !relativeToPageNumber) {
      setSubmitError('Choose which page your ad should go before or after.')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile)
      formData.append('linkType', linkType)
      formData.append('linkUrl', linkUrl.trim())
      if (label.trim()) formData.append('label', label.trim())
      formData.append('insertPosition', insertPosition)
      formData.append(
        'relativeToPageNumber',
        String(relativeToPageNumber || 1)
      )

      const res = await fetch(
        `/api/business/issues/${issueId}/ad-page-requests`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not submit request.')

      setSubmitted(true)
      resetForm()
      await fetchRequests()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
   
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="font-semibold text-gray-900">Request a new ad page</h3>

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        )}
        {submitted && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Request submitted. You&apos;ll see its status below once the
            Mara Media team reviews it.
          </div>
        )}

        <div>
          <label className="text-xs text-gray-500 block mb-1">Page PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            disabled={submitting}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
          />
        </div>

        {totalPages > 0 ? (
          <div className="flex flex-wrap gap-6 items-start">
            <div className="min-w-[240px]">
              <label className="text-xs text-gray-500 block mb-1">
                Placement
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInsertPosition('before')}
                    disabled={submitting}
                    className={`text-sm px-3 py-1.5 rounded-lg border ${
                      insertPosition === 'before'
                        ? 'bg-[#1C3664] text-white border-[#1C3664]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    Before page
                  </button>
                  <button
                    type="button"
                    onClick={() => setInsertPosition('after')}
                    disabled={submitting}
                    className={`text-sm px-3 py-1.5 rounded-lg border ${
                      insertPosition === 'after'
                        ? 'bg-[#1C3664] text-white border-[#1C3664]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    After page
                  </button>
                </div>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={relativeToPageNumber}
                  onChange={(e) => setRelativeToPageNumber(e.target.value)}
                  disabled={submitting}
                  className="w-24 text-sm border border-gray-200 rounded-lg px-3 py-1.5"
                />
                <span className="text-xs text-gray-400">
                  of {totalPages} pages
                </span>
              </div>
            </div>

            <IssuePagePreview
              pdfUrl={pdfUrl}
              pageNumber={Number(relativeToPageNumber) || null}
            />
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            This issue has no pages yet — your request will be reviewed once
            pages are available to place it against.
          </p>
        )}

        <div>
          <label className="text-xs text-gray-500 block mb-1">Type</label>
          <div className="flex gap-2">
          <button
              type="button"
              onClick={() => {
                if (!allowsLink) return
                setLinkType('link')
                setLinkUrl('')
              }}
              disabled={submitting || !allowsLink}
              title={!allowsLink ? 'Upgrade your package to add link ads.' : undefined}
              className={`flex-1 text-sm py-1.5 rounded-lg border ${
                linkType === 'link'
                  ? 'bg-[#1C3664] text-white border-[#1C3664]'
                  : 'border-gray-200 text-gray-600'
              } ${!allowsLink ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              🔗 Link
            </button>
            <button
              type="button"
              onClick={() => setLinkType('video')}
              disabled={submitting}
              className={`flex-1 text-sm py-1.5 rounded-lg border ${
                linkType === 'video'
                  ? 'bg-[#1C3664] text-white border-[#1C3664]'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              ▶ Video
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">
            {linkType === 'video'
              ? 'Video URL (YouTube, Vimeo, or .mp4)'
              : 'Link URL'}
          </label>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            disabled={submitting}
            placeholder={
              linkType === 'video'
                ? 'https://youtube.com/watch?v=...'
                : 'https://example.com'
            }
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Label (optional)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={submitting}
            placeholder="e.g. Watch our story"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full text-sm py-2.5 rounded-lg bg-[#1C3664] text-white font-semibold hover:bg-[#13294d] disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit for approval'}
        </button>
      </form>

     
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Your requests</h3>

        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-3">
            {loadError}
          </div>
        )}

        {loadingRequests ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-400">
            You haven&apos;t submitted any ad page requests for this issue
            yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {requests.map((r) => (
              <li
                key={r.id}
                className={`rounded-lg border px-3 py-2.5 text-sm ${STATUS_COLOR[r.status] || 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">
                    {r.linkType === 'video' ? '▶ Video' : '🔗 Link'}
                    {r.label ? ` — ${r.label}` : ''}
                  </p>
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {STATUS_LABEL[r.status] || r.status}
                  </span>
                </div>
                <p className="mt-1 text-xs opacity-80 truncate">{r.linkUrl}</p>
                <p className="mt-1 text-xs opacity-70">
                  {r.insertPosition === 'before' ? 'Before' : 'After'} page{' '}
                  {r.relativeToPageNumber}
                  {r.status === 'approved' && r.resultingPageNumber
                    ? ` · now on page ${r.resultingPageNumber}`
                    : ''}
                  {r.status === 'rejected' && r.rejectionReason
                    ? ` · ${r.rejectionReason}`
                    : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}