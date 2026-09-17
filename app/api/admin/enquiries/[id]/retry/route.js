import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request, { params }) {
  const existing = await prisma.enquiry.findUnique({ where: { id: params.id } })

  if (!existing) {
    return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
  }

  

  const enquiry = await prisma.enquiry.update({
    where: { id: params.id },
    data: {
      status: 'forwarded_to_ghl',
      forwardedAt: new Date(),
    },
    include: {
      businessProfile: { include: { business: true } },
      publication: true,
    },
  })

  return NextResponse.json({ enquiry })
}