// 'use client'

// import { useCallback, useEffect, useState } from 'react'

// const STATUS_LABEL = {
//   pending: 'Pending review',
//   approved: 'Approved',
//   rejected: 'Rejected',
// }

// const STATUS_COLOR = {
//   pending: 'bg-amber-50 border-amber-200 text-amber-700',
//   approved: 'bg-emerald-50 border-emerald-200 text-emerald-700',
//   rejected: 'bg-red-50 border-red-200 text-red-700',
// }

// export default function AdRequestForm({ publicationSlug }) {
//   const [ads, setAds] = useState([])
//   const [loadingAds, setLoadingAds] = useState(true)
//   const [loadError, setLoadError] = useState('')

//   const [pdfFile, setPdfFile] = useState(null)
//   const [linkType, setLinkType] = useState('link')
//   const [linkUrl, setLinkUrl] = useState('')
//   const [label, setLabel] = useState('')
//   const [price, setPrice] = useState('')

//   const [submitting, setSubmitting] = useState(false)
//   const [submitError, setSubmitError] = useState('')
//   const [submitted, setSubmitted] = useState(false)

//   const fetchAds = useCallback(async () => {
//     setLoadingAds(true)
//     setLoadError('')
//     try {
//       const res = await fetch(`/api/business/publications/${publicationSlug}/ads`)
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error || 'Could not load your ads.')
//       setAds(data.ads || [])
//     } catch (err) {
//       setLoadError(err.message)
//     } finally {
//       setLoadingAds(false)
//     }
//   }, [publicationSlug])

//   useEffect(() => {
//     fetchAds()
//   }, [fetchAds])

//   function resetForm() {
//     setPdfFile(null)
//     setLinkType('link')
//     setLinkUrl('')
//     setLabel('')
//     setPrice('')
//   }

//   async function handleSubmit(e) {
//     e.preventDefault()
//     setSubmitError('')
//     setSubmitted(false)

//     if (!pdfFile) {
//       setSubmitError('Choose a PDF for your ad.')
//       return
//     }
//     if (!linkUrl.trim()) {
//       setSubmitError(
//         linkType === 'video' ? 'Enter a video URL.' : 'Enter a link URL.'
//       )
//       return
//     }
//     const priceNumber = Number(price)
//     if (!price || Number.isNaN(priceNumber) || priceNumber <= 0) {
//       setSubmitError('Enter a valid price.')
//       return
//     }

//     setSubmitting(true)
//     try {
//       const formData = new FormData()
//       formData.append('pdf', pdfFile)
//       formData.append('linkType', linkType)
//       formData.append('linkUrl', linkUrl.trim())
//       if (label.trim()) formData.append('label', label.trim())
//       formData.append('priceCents', String(Math.round(priceNumber * 100)))

//       const res = await fetch(
//         `/api/business/publications/${publicationSlug}/ads`,
//         { method: 'POST', body: formData }
//       )
//       const data = await res.json()
//       if (!res.ok) throw new Error(data.error || 'Could not submit ad.')

//       setSubmitted(true)
//       resetForm()
//       await fetchAds()
//     } catch (err) {
//       setSubmitError(err.message)
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   return (
//     <div className="space-y-8">

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <h3 className="font-semibold text-gray-900">Submit a new ad</h3>

//         {submitError && (
//           <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//             {submitError}
//           </div>
//         )}
//         {submitted && (
//           <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
//             Ad submitted. You&apos;ll see its status below once the Mara
//             Media team reviews it.
//           </div>
//         )}

//         <div>
//           <label className="text-xs text-gray-500 block mb-1">Ad PDF</label>
//           <input
//             type="file"
//             accept="application/pdf"
//             onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
//             disabled={submitting}
//             className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
//           />
//         </div>

//         <div>
//           <label className="text-xs text-gray-500 block mb-1">Type</label>
//           <div className="flex gap-2">
//             <button
//               type="button"
//               onClick={() => setLinkType('link')}
//               disabled={submitting}
//               className={`flex-1 text-sm py-1.5 rounded-lg border ${
//                 linkType === 'link'
//                   ? 'bg-[#1C3664] text-white border-[#1C3664]'
//                   : 'border-gray-200 text-gray-600'
//               }`}
//             >
//               🔗 Link
//             </button>
//             <button
//               type="button"
//               onClick={() => setLinkType('video')}
//               disabled={submitting}
//               className={`flex-1 text-sm py-1.5 rounded-lg border ${
//                 linkType === 'video'
//                   ? 'bg-[#1C3664] text-white border-[#1C3664]'
//                   : 'border-gray-200 text-gray-600'
//               }`}
//             >
//               ▶ Video
//             </button>
//           </div>
//         </div>

//         <div>
//           <label className="text-xs text-gray-500 block mb-1">
//             {linkType === 'video'
//               ? 'Video URL (YouTube, Vimeo, or .mp4)'
//               : 'Link URL'}
//           </label>
//           <input
//             type="text"
//             value={linkUrl}
//             onChange={(e) => setLinkUrl(e.target.value)}
//             disabled={submitting}
//             placeholder={
//               linkType === 'video'
//                 ? 'https://youtube.com/watch?v=...'
//                 : 'https://example.com'
//             }
//             className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
//           />
//         </div>

//         <div>
//           <label className="text-xs text-gray-500 block mb-1">
//             Label (optional)
//           </label>
//           <input
//             type="text"
//             value={label}
//             onChange={(e) => setLabel(e.target.value)}
//             disabled={submitting}
//             placeholder="e.g. Watch our story"
//             className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
//           />
//         </div>

//         <div>
//           <label className="text-xs text-gray-500 block mb-1">
//             Price for readers to unlock (USD)
//           </label>
//           <input
//             type="number"
//             min="0"
//             step="0.01"
//             value={price}
//             onChange={(e) => setPrice(e.target.value)}
//             disabled={submitting}
//             placeholder="e.g. 4.99"
//             className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
//           />
//         </div>

//         <button
//           type="submit"
//           disabled={submitting}
//           className="w-full text-sm py-2.5 rounded-lg bg-[#1C3664] text-white font-semibold hover:bg-[#13294d] disabled:opacity-50"
//         >
//           {submitting ? 'Submitting…' : 'Submit for approval'}
//         </button>
//       </form>


//       <div>
//         <h3 className="font-semibold text-gray-900 mb-3">Your ads</h3>

//         {loadError && (
//           <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-3">
//             {loadError}
//           </div>
//         )}

//         {loadingAds ? (
//           <p className="text-sm text-gray-400">Loading…</p>
//         ) : ads.length === 0 ? (
//           <p className="text-sm text-gray-400">
//             You haven&apos;t submitted any ads for this publication yet.
//           </p>
//         ) : (
//           <ul className="space-y-2">
//             {ads.map((ad) => (
//               <li
//                 key={ad.id}
//                 className={`rounded-lg border px-3 py-2.5 text-sm ${STATUS_COLOR[ad.status] || 'border-gray-200'}`}
//               >
//                 <div className="flex items-center justify-between gap-3">
//                   <p className="font-medium">
//                     {ad.linkType === 'video' ? '▶ Video' : '🔗 Link'}
//                     {ad.label ? ` — ${ad.label}` : ''}
//                   </p>
//                   <span className="text-xs font-semibold uppercase tracking-wide">
//                     {STATUS_LABEL[ad.status] || ad.status}
//                   </span>
//                 </div>
//                 <p className="mt-1 text-xs opacity-80 truncate">{ad.linkUrl}</p>
//                 <p className="mt-1 text-xs opacity-70">
//                   ${(ad.priceCents / 100).toFixed(2)}
//                   {ad.status === 'rejected' && ad.rejectionReason
//                     ? ` · ${ad.rejectionReason}`
//                     : ''}
//                   {' · '}
//                   {ad.clickCount} click{ad.clickCount === 1 ? '' : 's'}
//                 </p>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   )
// }


'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PDFDocument } from 'pdf-lib'


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


export default function AdRequestForm({ publicationSlug, allowsVideo = false, allowsLink = false }) {
  const router = useRouter()

  const [ads, setAds] = useState([])

  const [loadingAds, setLoadingAds] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [pdfFile, setPdfFile] = useState(null)
  const [pdfPageCount, setPdfPageCount] = useState(null)
  const [pdfError, setPdfError] = useState('')
  const [pageNumber, setPageNumber] = useState(1)

  const [linkType, setLinkType] = useState('link')
  const [linkUrl, setLinkUrl] = useState('')
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoError, setVideoError] = useState('')
  const [videoFileName, setVideoFileName] = useState('')

  const [label, setLabel] = useState('')
  const [price, setPrice] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const fetchAds = useCallback(async () => {
    setLoadingAds(true)
    setLoadError('')
    try {
      const res = await fetch(`/api/business/publications/${publicationSlug}/ads`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not load your ads.')
      setAds(data.ads || [])
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoadingAds(false)
    }
  }, [publicationSlug])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  function resetForm() {
    setPdfFile(null)
    setPdfPageCount(null)
    setPdfError('')
    setPageNumber(1)
    setLinkType('link')
    setLinkUrl('')
    setVideoFileName('')
    setLabel('')
    setPrice('')
  }

  async function handlePdfChange(e) {
    const file = e.target.files?.[0] || null
    setPdfFile(file)
    setPdfPageCount(null)
    setPdfError('')
    setPageNumber(1)

    if (!file) return

    try {
      const bytes = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(bytes)
      const count = pdfDoc.getPageCount()
      setPdfPageCount(count)
    } catch (err) {
      setPdfError('Could not read this PDF. Try a different file.')
    }
  }

  async function handleVideoFileChange(e) {
    const file = e.target.files?.[0] || null
    if (!file) return

    setVideoError('')
    setVideoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/business/ads/upload-video', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Video upload failed.')

      setLinkUrl(data.url)
      setVideoFileName(file.name)
    } catch (err) {
      setVideoError(err.message)
    } finally {
      setVideoUploading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    setSubmitted(false)

    if (linkType === 'video' && !allowsVideo) {
      setSubmitError('Your package does not include video ads.')
      return
    }
    if (linkType === 'link' && !allowsLink) {
      setSubmitError('Your package does not include link ads.')
      return
    }
    if (!pdfFile) {
      setSubmitError('Choose a PDF for your ad.')
      return
    }
    if (pdfError) {
      setSubmitError('Fix the PDF issue before submitting.')
      return
    }
    if (!linkUrl.trim()) {
      setSubmitError(
        linkType === 'video' ? 'Upload a video or enter a video URL.' : 'Enter a link URL.'
      )
      return
    }
    const priceNumber = Number(price)
    

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile)
      formData.append('pageNumber', String(pageNumber))
      formData.append('linkType', linkType)
      formData.append('linkUrl', linkUrl.trim())
      if (label.trim()) formData.append('label', label.trim())
      formData.append('priceCents', String(Math.round(priceNumber * 100)))

      const res = await fetch(
        `/api/business/publications/${publicationSlug}/ads`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not submit ad.')

        setSubmitted(true)
        resetForm()
        await fetchAds()
        router.refresh()
      } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">

      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="font-semibold text-gray-900">Submit a new ad</h3>

        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {submitError}
          </div>
        )}
        {submitted && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Ad submitted. You&apos;ll see its status below once the Mara
            Media team reviews it.
          </div>
        )}

        <div>
          <label className="text-xs text-gray-500 block mb-1">Ad PDF</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePdfChange}
            disabled={submitting}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
          />
          {pdfError && (
            <p className="mt-1 text-xs text-red-600">{pdfError}</p>
          )}
        </div>

        {pdfPageCount && (
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Which page should the link/video appear on?
            </label>
            <select
              value={pageNumber}
              onChange={(e) => setPageNumber(Number(e.target.value))}
              disabled={submitting}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
            >
              {Array.from({ length: pdfPageCount }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  Page {n} of {pdfPageCount}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-xs text-gray-500 block mb-1">Type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setLinkType('link')
                setLinkUrl('')
                setVideoFileName('')
              }}
              disabled={submitting}
              className={`flex-1 text-sm py-1.5 rounded-lg border ${
                linkType === 'link'
                  ? 'bg-[#1C3664] text-white border-[#1C3664]'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              🔗 Link
            </button>
            <button
              type="button"
              onClick={() => {
                if (!allowsVideo) return
                setLinkType('video')
                setLinkUrl('')
                setVideoFileName('')
              }}
              disabled={submitting || !allowsVideo}
              title={!allowsVideo ? 'Upgrade your package to add video ads.' : undefined}
              className={`flex-1 text-sm py-1.5 rounded-lg border ${
                linkType === 'video'
                  ? 'bg-[#1C3664] text-white border-[#1C3664]'
                  : 'border-gray-200 text-gray-600'
              } ${!allowsVideo ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              ▶ Video
            </button>
          </div>
        </div>

        {linkType === 'video' ? (
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Upload a video file
              </label>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoFileChange}
                disabled={submitting || videoUploading}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
              />
              {videoUploading && (
                <p className="mt-1 text-xs text-gray-500">Uploading…</p>
              )}
              {videoFileName && !videoUploading && (
                <p className="mt-1 text-xs text-emerald-600">Uploaded: {videoFileName}</p>
              )}
              {videoError && (
                <p className="mt-1 text-xs text-red-600">{videoError}</p>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Or paste a video URL (YouTube, Vimeo, etc.)
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => {
                  setLinkUrl(e.target.value)
                  setVideoFileName('')
                }}
                disabled={submitting || videoUploading}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs text-gray-500 block mb-1">Link URL</label>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              disabled={submitting}
              placeholder="https://example.com"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
        )}

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

        {/* <div>
          <label className="text-xs text-gray-500 block mb-1">
            Price for readers to unlock (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={submitting}
            placeholder="e.g. 4.99"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
          />
        </div> */}

        <button
          type="submit"
          disabled={submitting || videoUploading}
          className="w-full text-sm py-2.5 rounded-lg bg-[#1C3664] text-white font-semibold hover:bg-[#13294d] disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit for approval'}
        </button>
      </form>


      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Your ads</h3>

        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 mb-3">
            {loadError}
          </div>
        )}

        {loadingAds ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : ads.length === 0 ? (
          <p className="text-sm text-gray-400">
            You haven&apos;t submitted any ads for this publication yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {ads.map((ad) => (
              <li
                key={ad.id}
                className={`rounded-lg border px-3 py-2.5 text-sm ${STATUS_COLOR[ad.status] || 'border-gray-200'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">
                    {ad.linkType === 'video' ? '▶ Video' : '🔗 Link'}
                    {ad.label ? ` — ${ad.label}` : ''}
                  </p>
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {STATUS_LABEL[ad.status] || ad.status}
                  </span>
                </div>
                <p className="mt-1 text-xs opacity-80 truncate">{ad.linkUrl}</p>
                <p className="mt-1 text-xs opacity-70">
                  Page {ad.pageNumber || 1} · ${(ad.priceCents / 100).toFixed(2)}
                  {ad.status === 'rejected' && ad.rejectionReason
                    ? ` · ${ad.rejectionReason}`
                    : ''}
                  {' · '}
                  {ad.clickCount} click{ad.clickCount === 1 ? '' : 's'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}