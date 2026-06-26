import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  const { advertiserName, advertiserEmail, publicationId, amountEuros, notes } = await req.json()

  if (!advertiserName || !publicationId || !amountEuros || amountEuros < 1) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const publication = await prisma.publication.findUnique({ where: { id: publicationId } })
  if (!publication) return NextResponse.json({ error: 'Publication not found' }, { status: 404 })

  const baseUrl = process.env.NEXTAUTH_URL

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: advertiserEmail || undefined,
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(amountEuros * 100),
        product_data: {
          name: `Advertising Deposit — ${publication.title}`,
          description: notes || `Deposit for ${advertiserName}`,
        },
      },
      quantity: 1,
    }],
    success_url: `${baseUrl}/admin/advertisers?paid=1`,
    cancel_url: `${baseUrl}/admin/advertisers`,
    metadata: { advertiserName, advertiserEmail, publicationId },
  })

  await prisma.advertiserPayment.create({
    data: {
      advertiserName,
      advertiserEmail: advertiserEmail || '',
      publicationId,
      amountCents: Math.round(amountEuros * 100),
      stripePaymentLinkId: session.id,
      paymentUrl: session.url,
      status: 'pending',
    },
  })

  return NextResponse.json({ url: session.url })
}