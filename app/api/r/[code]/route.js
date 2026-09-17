import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req, { params }) {
  const { code } = await params

  const link = await prisma.campaignLink.findUnique({
    where: { code },
  })

  if (!link) {
    return NextResponse.redirect(new URL('/', req.url))
  }


  if (!link.isActive) {
    return NextResponse.redirect(
      new URL(`/link-disabled?label=${encodeURIComponent(link.label)}`, req.url)
    )
  }

  
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.role === 'admin'

  if (!isAdmin) {
    await prisma.engagementEvent.create({
      data: {
        eventType: 'qr_scan',
        campaignLinkId: link.id,
        publicationId: link.publicationId,
        metadata: {
          userAgent: req.headers.get('user-agent'),
          referer: req.headers.get('referer'),
        },
      },
    })
  }

  return NextResponse.redirect(link.destinationUrl)
}