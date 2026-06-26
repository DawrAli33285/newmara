import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { publicationSlug } = await req.json()

  const publication = await prisma.publication.findUnique({ where: { slug: publicationSlug } })
  if (!publication?.stripePriceId) {
    return NextResponse.json({ error: 'Publication not configured for payments' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })

  const existing = await prisma.subscription.findFirst({
    where: { userId: user.id, publicationId: publication.id, status: 'active' },
  })
  if (existing) return NextResponse.json({ error: 'Already subscribed' }, { status: 400 })

  const baseUrl = process.env.NEXTAUTH_URL

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: session.user.email,
    line_items: [{ price: publication.stripePriceId, quantity: 1 }],
    success_url: `${baseUrl}/read/${publicationSlug}?subscribed=1`,
    cancel_url: `${baseUrl}/subscribe/${publicationSlug}?cancelled=1`,
    subscription_data: {
      metadata: {
        userId: user.id,
        publicationId: publication.id,
        publicationSlug,
      },
    },
  })

  return NextResponse.json({ url: checkoutSession.url })
}