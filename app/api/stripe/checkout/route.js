import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await req.json().catch(() => null)
    const publicationSlug = body?.publicationSlug
    if (!publicationSlug) {
      return NextResponse.json({ error: 'Missing publication' }, { status: 400 })
    }

    const publication = await prisma.publication.findUnique({ where: { slug: publicationSlug } })
    if (!publication?.stripePriceId) {
      return NextResponse.json({ error: 'Publication not configured for payments' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const existing = await prisma.subscription.findFirst({
      where: { userId: user.id, publicationId: publication.id, status: 'active' },
    })
    if (existing) {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 400 })
    }

    const baseUrl = process.env.NEXTAUTH_URL
    if (!baseUrl) {
      console.error('Stripe checkout error: NEXTAUTH_URL is not set')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

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
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Unable to start checkout' }, { status: 500 })
  }
}