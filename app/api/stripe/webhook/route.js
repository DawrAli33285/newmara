import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    if (session.mode === 'subscription') {
      const sub = await stripe.subscriptions.retrieve(session.subscription)
      const { userId, publicationId } = sub.metadata

      if (userId && publicationId) {
        await prisma.subscription.upsert({
          where: { userId_publicationId: { userId, publicationId } },
          create: {
            userId,
            publicationId,
            stripeSubscriptionId: sub.id,
            stripeCustomerId: sub.customer,
            status: 'active',
            currentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
          },
          update: {
            stripeSubscriptionId: sub.id,
            stripeCustomerId: sub.customer,
            status: 'active',
            currentPeriodEnd: sub.current_period_end
              ? new Date(sub.current_period_end * 1000)
              : null,
          },
        })
      }
    }

    if (session.mode === 'payment') {
      await prisma.advertiserPayment.updateMany({
        where: { stripePaymentLinkId: session.id },
        data: {
          status: 'paid',
          stripePaymentIntentId: session.payment_intent,
        },
      })
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: {
        status: sub.status === 'active' ? 'active' : 'expired',
        ...(sub.current_period_end
          ? { currentPeriodEnd: new Date(sub.current_period_end * 1000) }
          : {}),
      },
    })
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: { status: 'cancelled' },
    })
  }

  return NextResponse.json({ received: true })
}