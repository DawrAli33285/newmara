import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const formData = await req.formData()
    const publicationId = formData.get('publicationId')
    const issueNumber = parseInt(formData.get('issueNumber'))
    const title = formData.get('title')
    const isPublished = formData.get('isPublished') === 'true'
    const pdfFile = formData.get('pdf')
    const coverFile = formData.get('cover')

    const publication = await prisma.publication.findUnique({ where: { id: publicationId } })
    if (!publication) return NextResponse.json({ error: 'Publication not found' }, { status: 404 })

    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer())
    const pdfPath = `${publication.slug}/issue-${issueNumber}.pdf`

    const { error: pdfError } = await supabase.storage
      .from('publications')
      .upload(pdfPath, pdfBuffer, { contentType: 'application/pdf', upsert: true })

    if (pdfError) return NextResponse.json({ error: pdfError.message }, { status: 500 })

    const { data: pdfUrlData } = supabase.storage.from('publications').getPublicUrl(pdfPath)

    let coverImageUrl = null
    if (coverFile && coverFile.size > 0) {
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer())
      const coverExt = coverFile.name.split('.').pop()
      const coverPath = `${publication.slug}/issue-${issueNumber}-cover.${coverExt}`

      await supabase.storage
        .from('covers')
        .upload(coverPath, coverBuffer, { contentType: coverFile.type, upsert: true })

      const { data: coverUrlData } = supabase.storage.from('covers').getPublicUrl(coverPath)
      coverImageUrl = coverUrlData.publicUrl
    }

    await prisma.issue.create({
      data: { publicationId, issueNumber, title, pdfUrl: pdfUrlData.publicUrl, coverImageUrl, isPublished },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}