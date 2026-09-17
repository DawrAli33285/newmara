import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { id } = await params 
    const body = await req.json()
    const { action } = body

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'." }, { status: 400 })
    }

    const existing = await prisma.offer.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'Offer not found.' }, { status: 404 })
    }

    if (existing.status !== 'submitted') {
      return NextResponse.json({ error: 'Only submitted offers can be reviewed.' }, { status: 409 })
    }

    const offer = await prisma.offer.update({
      where: { id },
      data: action === 'approve'
        ? {
            status: 'live',
            approvedBy: session.user.email,
            approvedAt: new Date(),
          }
        : {
            status: 'denied',
            approvedBy: session.user.email,
            approvedAt: new Date(),
          },
    })
    
    await prisma.auditLog.create({
      data: {
        actor: session.user.email,
        action: action === 'approve' ? 'approved offer' : 'rejected offer',
        recordLabel: `Offer: ${offer.title}`,
      },
    })
    
    return NextResponse.json({ success: true, offer })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}