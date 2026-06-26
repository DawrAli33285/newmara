import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subscriptionId, stripeSubscriptionId } = await req.json()

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } })

  if (!sub || sub.userId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (stripeSubscriptionId) {
    await stripe.subscriptions.cancel(stripeSubscriptionId)
  }

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'cancelled' },
  })

  return NextResponse.json({ success: true })
}