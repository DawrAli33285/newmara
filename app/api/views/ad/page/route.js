import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { adId, pageNumber } = await req.json()
  if (!adId || !pageNumber) return NextResponse.json({ error: 'adId and pageNumber required' }, { status: 400 })

  await prisma.engagementEvent.create({
    data: {
      eventType: 'ad_page_view',
      userId: session.user.id,
      metadata: { adId, pageNumber },
    },
  })

  return NextResponse.json({ ok: true })
}