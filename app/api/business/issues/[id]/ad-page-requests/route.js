import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function getSessionAdvertiser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.accountType !== 'business') {
    return null
  }

  const advertiser = await prisma.advertiser.findUnique({
    where: { businessId: session.user.id },
    select: { id: true },
  })
  return advertiser
}

export async function GET(req, { params }) {
  const { id } = await params

  const advertiser = await getSessionAdvertiser()
  if (!advertiser) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
  }

  try {
    const requests = await prisma.adPageRequest.findMany({
      where: { issueId: id, advertiserId: advertiser.id },
      orderBy: { submittedAt: 'desc' },
    })
    return NextResponse.json({ requests })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Could not load requests.' },
      { status: 500 }
    )
  }
}

export async function POST(req, { params }) {
  const { id } = await params

  const advertiser = await getSessionAdvertiser()
  if (!advertiser) {
    return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
  }

  try {
    const issue = await prisma.issue.findUnique({
      where: { id },
      select: { id: true, publicationId: true, totalPages: true },
    })
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found.' }, { status: 404 })
    }

    const formData = await req.formData()
    const pdf = formData.get('pdf')
    const linkType = formData.get('linkType')
    const linkUrl = formData.get('linkUrl')
    const label = formData.get('label') || null
    const insertPosition = formData.get('insertPosition')
    const relativeToPageNumberRaw = formData.get('relativeToPageNumber')

    if (!pdf || pdf.size === 0) {
      return NextResponse.json({ error: 'No PDF provided.' }, { status: 400 })
    }
    if (pdf.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF.' }, { status: 400 })
    }
    if (pdf.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 25MB.' }, { status: 400 })
    }
    if (!['link', 'video'].includes(linkType)) {
      return NextResponse.json({ error: 'Type must be link or video.' }, { status: 400 })
    }
    if (!linkUrl || !linkUrl.trim()) {
      return NextResponse.json({ error: 'A URL is required.' }, { status: 400 })
    }
    if (!['before', 'after'].includes(insertPosition)) {
      return NextResponse.json({ error: 'Position must be before or after.' }, { status: 400 })
    }

    const relativeToPageNumber = Number(relativeToPageNumberRaw)
    const totalPages = issue.totalPages || 0
    if (
      totalPages > 0 &&
      (!Number.isInteger(relativeToPageNumber) ||
        relativeToPageNumber < 1 ||
        relativeToPageNumber > totalPages)
    ) {
      return NextResponse.json(
        { error: `Page must be between 1 and ${totalPages}.` },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await pdf.arrayBuffer())
    const path = `ad-page-requests/${id}/${advertiser.id}-${Date.now()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('artwork')
      .upload(path, buffer, { contentType: 'application/pdf', upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('artwork').getPublicUrl(path)

    const request = await prisma.adPageRequest.create({
      data: {
        issueId: id,
        advertiserId: advertiser.id,
        publicationId: issue.publicationId,
        pdfUrl: urlData.publicUrl,
        pdfFileName: pdf.name,
        linkType,
        linkUrl: linkUrl.trim(),
        insertPosition,
        relativeToPageNumber: totalPages > 0 ? relativeToPageNumber : 1,
        status: 'pending',
      },
    })

    return NextResponse.json({ request }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not submit request.' }, { status: 500 })
  }
}