import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const { isPublished } = await req.json()

    const issue = await prisma.issue.update({
      where: { id },
      data: { isPublished },
    })

    return NextResponse.json(issue)
  } catch (err) {
    console.log("ERROR IS")
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Missing issue id' }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.issueView.deleteMany({ where: { issueId: id } }),
      prisma.pageView.deleteMany({ where: { issueId: id } }),
      prisma.pageOverlay.deleteMany({ where: { issueId: id } }),
      prisma.issue.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}