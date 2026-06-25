import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { publicationId } = await req.json()

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const existing = await prisma.subscription.findFirst({
    where: { userId: user.id, publicationId, status: 'active' },
  })
  if (existing) return NextResponse.json({ error: 'Already subscribed' }, { status: 400 })

  const currentPeriodEnd = new Date()
  currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1)

  await prisma.subscription.create({
    data: {
      userId: user.id,
      publicationId,
      status: 'active',
      currentPeriodEnd,
    },
  })

  return NextResponse.json({ success: true })
}