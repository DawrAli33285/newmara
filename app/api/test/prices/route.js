import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET() {
  const ids = [
    'price_1TnGK5LyHmPH8TShIomv8RrN',
    'price_1TmVZPLyHmPH8TShxaABWHD1',
    'price_1TmVZQLyHmPH8TShKlZL4Nil',
    'price_1TmVZRLyHmPH8TShUETMTnbV',
    'price_1TmVZTLyHmPH8TShcSLaGZvM',
  ]

  const results = await Promise.all(
    ids.map(async (id) => {
      const p = await stripe.prices.retrieve(id, { expand: ['product'] })
      return {
        id,
        product: p.product.name,
        interval: p.recurring?.interval,
        amount: p.unit_amount / 100,
        currency: p.currency.toUpperCase(),
      }
    })
  )

  return NextResponse.json(results)
}