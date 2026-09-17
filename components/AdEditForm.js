'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

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

export default function AdEditForm({ publicationSlug, ad, allowsVideo = false, allowsLink = false }) {

  const router = useRouter()

  const [pdfFile, setPdfFile] = useState(null)
  const [linkType, setLinkType] = useState(ad.linkType)
  const [linkUrl, setLinkUrl] = useState(ad.linkUrl)
  const [videoUploading, setVideoUploading] = useState(false)
  const [videoError, setVideoError] = useState('')
  const [videoFileName, setVideoFileName] = useState(
    ad.linkType === 'video' ? ad.pdfFileName || '' : ''
  )
  const [label, setLabel] = useState(ad.label || '')
  const [price, setPrice] = useState((ad.priceCents / 100).toFixed(2))

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSaveError('')
    setSaved(false)

    if (linkType === 'video' && !allowsVideo) {
      setSaveError('Your package does not include video ads.')
      return
    }
    if (linkType === 'link' && !allowsLink) {
      setSaveError('Your package does not include link ads.')
      return
    }
    if (!linkUrl.trim()) {
      setSaveError(linkType === 'video' ? 'Enter a video URL.' : 'Enter a link URL.')
      return
    }


    const priceNumber = Number(price)
    if (!price || Number.isNaN(priceNumber) || priceNumber <= 0) {
      setSaveError('Enter a valid price.')
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      if (pdfFile) formData.append('pdf', pdfFile)
      formData.append('linkType', linkType)
      formData.append('linkUrl', linkUrl.trim())
      formData.append('label', label.trim())
      formData.append('priceCents', String(Math.round(priceNumber * 100)))

      const res = await fetch(
        `/api/business/publications/${publicationSlug}/ads/${ad.id}`,
        { method: 'PATCH', body: formData }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save changes.')

      setSaved(true)
      setPdfFile(null)
      router.refresh()
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
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




  async function handleDelete() {
    if (!confirm('Withdraw this ad? This cannot be undone.')) return

    setDeleteError('')
    setDeleting(true)
    try {
      const res = await fetch(
        `/api/business/publications/${publicationSlug}/ads/${ad.id}`,
        { method: 'DELETE' }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Could not withdraw ad.')
      }
      router.push(`/business/adpage/${publicationSlug}`)
      router.refresh()
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex text-xs font-semibold uppercase tracking-wide rounded-full border px-3 py-1 ${
            STATUS_COLOR[ad.status] || 'border-gray-200'
          }`}
        >
          {STATUS_LABEL[ad.status] || ad.status}
        </span>
        <span className="text-xs text-gray-400">
          {ad.clickCount} click{ad.clickCount === 1 ? '' : 's'}
        </span>
      </div>

      {ad.status === 'rejected' && ad.rejectionReason && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Rejection reason: {ad.rejectionReason}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {saveError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {saveError}
          </div>
        )}
        {saved && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Saved. Your ad has been re-submitted for admin approval.
          </div>
        )}

        <div>
          <label className="text-xs text-gray-500 block mb-1">
            Ad PDF {ad.pdfFileName ? `(current: ${ad.pdfFileName})` : ''}
          </label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            disabled={saving || deleting}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
          />
          <p className="mt-1 text-[11px] text-gray-400">
            Leave blank to keep the current PDF.
          </p>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Type</label>
          <div className="flex gap-2">
          <button
              type="button"
              onClick={() => {
                if (!allowsLink) return
                setLinkType('link')
                setLinkUrl('')
                setVideoFileName('')
              }}
              disabled={saving || deleting || !allowsLink}
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
              onClick={() => {
                if (!allowsVideo) return
                setLinkType('video')
                setLinkUrl('')
                setVideoFileName('')
              }}
              disabled={saving || deleting || !allowsVideo}
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
                disabled={saving || deleting || videoUploading}
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
                disabled={saving || deleting || videoUploading}
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
              disabled={saving || deleting}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
        )}

        <div>
          <label className="text-xs text-gray-500 block mb-1">Label (optional)</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            disabled={saving || deleting}
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
            disabled={saving || deleting}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2"
          />
        </div> */}

<button
          type="submit"
          disabled={saving || deleting || videoUploading}
          className="w-full text-sm py-2.5 rounded-lg bg-[#1C3664] text-white font-semibold hover:bg-[#13294d] disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save & re-submit for approval'}
        </button>
      </form>

      <div className="border-t border-gray-100 pt-5">
        {deleteError && (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {deleteError}
          </div>
        )}
        {ad.status === 'pending' ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving || deleting}
            className="w-full text-sm py-2.5 rounded-lg border border-red-200 text-red-700 font-semibold hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? 'Withdrawing…' : 'Withdraw this ad'}
          </button>
        ) : (
          <p className="text-xs text-gray-400 text-center">
            Only pending ads can be withdrawn.
          </p>
        )}
      </div>
    </div>
  )
}