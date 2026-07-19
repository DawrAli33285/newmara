import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { PDFDocument } from 'pdf-lib'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req, { params }) {
  const { id } = await params

  try {
    const formData = await req.formData()
    const pdfFile = formData.get('pdf')

    const afterPage = parseInt(formData.get('afterPage'), 10) 

    if (!pdfFile) {
      return NextResponse.json({ error: 'A PDF file is required' }, { status: 400 })
    }
    if (Number.isNaN(afterPage) || afterPage < 0) {
      return NextResponse.json({ error: 'afterPage must be 0 or a positive number' }, { status: 400 })
    }

    const issue = await prisma.issue.findUnique({ where: { id } })
    if (!issue) {
      return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
    }

    const pdfRes = await fetch(issue.pdfUrl)
    if (!pdfRes.ok) {
      return NextResponse.json({ error: 'Could not fetch existing PDF' }, { status: 500 })
    }
    const existingPdfBytes = await pdfRes.arrayBuffer()
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    const totalPages = pdfDoc.getPageCount()
    const insertIndex = Math.min(afterPage, totalPages) 

    const uploadBytes = await pdfFile.arrayBuffer()
    let uploadDoc
    try {
      uploadDoc = await PDFDocument.load(uploadBytes)
    } catch {
      return NextResponse.json({ error: 'The uploaded file is not a valid PDF' }, { status: 400 })
    }

    const uploadPageCount = uploadDoc.getPageCount()
    if (uploadPageCount === 0) {
      return NextResponse.json({ error: 'The uploaded PDF has no pages' }, { status: 400 })
    }

    const copiedPages = await pdfDoc.copyPages(uploadDoc, uploadDoc.getPageIndices())
    copiedPages.forEach((page, i) => {
      pdfDoc.insertPage(insertIndex + i, page)
    })

    const modifiedPdfBytes = await pdfDoc.save()
    const urlParts = issue.pdfUrl.split('/publications/')
    const oldStoragePath = urlParts[1]

   
    const pathWithoutExt = oldStoragePath.replace(/\.pdf$/i, '')
    const newStoragePath = `${pathWithoutExt}-v${Date.now()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('publications')
      .upload(newStoragePath, Buffer.from(modifiedPdfBytes), {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to save updated PDF: ' + uploadError.message }, { status: 500 })
    }

    const { data: newUrlData } = supabase.storage.from('publications').getPublicUrl(newStoragePath)
    const newPdfUrl = newUrlData.publicUrl

    await prisma.issue.update({
      where: { id },
      data: { pdfUrl: newPdfUrl },
    })

    supabase.storage.from('publications').remove([oldStoragePath]).catch(() => {})

    await prisma.pageOverlay.updateMany({
      where: {
        issueId: id,
        pageNumber: { gt: insertIndex }, 
      },
      data: {
        pageNumber: { increment: uploadPageCount },
      },
    })

    return NextResponse.json({
      success: true,
      newPageNumber: insertIndex + 1, 
      insertedPageCount: uploadPageCount,
      totalPages: pdfDoc.getPageCount(),
      pdfUrl: newPdfUrl,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to insert page: ' + err.message }, { status: 500 })
  }
}