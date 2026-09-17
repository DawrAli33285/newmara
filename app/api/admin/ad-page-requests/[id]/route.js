// app/api/admin/ad-page-requests/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { mergePdfPage } from '@/lib/mergePdfPage'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function PATCH(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { action } = body // only "approve" reaches this route now — reject lives at /reject

  const request = await prisma.adPageRequest.findUnique({
    where: { id },
    include: { issue: { include: { publication: true } } },
  })
  if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  if (request.status !== 'pending') {
    return NextResponse.json({ error: 'Request already reviewed' }, { status: 400 })
  }

  if (action !== 'approve') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const reviewerId = session.user.email || session.user.id

  const { issue } = request
  const resultingPageNumber =
    request.insertPosition === 'before'
      ? request.relativeToPageNumber
      : request.relativeToPageNumber + 1

  const [baseRes, newPageRes] = await Promise.all([
    fetch(issue.pdfUrl),
    fetch(request.pdfUrl),
  ])
  if (!baseRes.ok || !newPageRes.ok) {
    return NextResponse.json({ error: 'Could not fetch source PDFs for merge' }, { status: 500 })
  }
  const baseBuffer = Buffer.from(await baseRes.arrayBuffer())
  const newPageBuffer = Buffer.from(await newPageRes.arrayBuffer())

  let merged
  try {
    merged = await mergePdfPage({
      baseBuffer,
      newPageBuffer,
      insertIndex: resultingPageNumber - 1,
    })
  } catch (err) {
    console.error('PDF merge failed:', err)
    return NextResponse.json({ error: 'Could not merge PDF page — file may be corrupt' }, { status: 400 })
  }

  const existingVersions = Array.isArray(issue.pdfVersions) ? issue.pdfVersions : []
  const versionedPath = `${issue.publication.slug}/issue-${issue.issueNumber}-v${Date.now()}.pdf`
  const { error: uploadError } = await supabase.storage
    .from('publications')
    .upload(versionedPath, merged.buffer, { contentType: 'application/pdf', upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: newUrlData } = supabase.storage.from('publications').getPublicUrl(versionedPath)

  const result = await prisma.$transaction(async (tx) => {
    await tx.pageOverlay.updateMany({
      where: { issueId: issue.id, pageNumber: { gte: resultingPageNumber } },
      data: { pageNumber: { increment: 1 } },
    })

    const updatedIssue = await tx.issue.update({
      where: { id: issue.id },
      data: {
        pdfUrl: newUrlData.publicUrl,
        totalPages: merged.totalPages,
        pdfVersions: [
          ...existingVersions,
          {
            url: newUrlData.publicUrl,
            previousUrl: issue.pdfUrl,
            createdAt: new Date().toISOString(),
            adPageRequestId: request.id,
          },
        ],
      },
    })

    const overlay = await tx.pageOverlay.create({
      data: {
        issueId: issue.id,
        pageNumber: resultingPageNumber,
        type: request.linkType,
        url: request.linkUrl,
        label: request.label || null,
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      },
    })

    const updatedRequest = await tx.adPageRequest.update({
      where: { id },
      data: {
        status: 'approved',
        resultingOverlayId: overlay.id,
        resultingPageNumber,
        reviewedAt: new Date(),
        reviewedBy: reviewerId,
      },
    })

    // Addendum §18 — record who changed what and when
    await tx.auditLog.create({
      data: {
        actor: reviewerId,
        action: `approved ad page request (now on page ${resultingPageNumber})`,
        recordLabel: `Ad page request: ${updatedRequest.id}`,
      },
    })

    return { issue: updatedIssue, request: updatedRequest }
  })

  return NextResponse.json(result)
}