
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const { packageId } = await req.json()

    if (!packageId) {
      return NextResponse.json({ error: 'packageId is required.' }, { status: 400 })
    }

    const pkg = await prisma.digitalPackage.findUnique({ where: { id: packageId } })

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found.' }, { status: 404 })
    }

    if (pkg.priceCents == null) {
      return NextResponse.json({ error: 'This package has no price set.' }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.priceCents,
      currency: 'eur',
      metadata: { packageId: pkg.id, packageName: pkg.name },
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not start payment.' }, { status: 500 })
  }
}