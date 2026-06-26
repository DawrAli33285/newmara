import 'dotenv/config'
import Stripe from 'stripe'
import { PrismaClient } from '@prisma/client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const prisma = new PrismaClient()

const publications = [
  { slug: 'the-skipper',  name: 'The Skipper',  amount: 999 },
  { slug: 'take-off',     name: 'Take Off',      amount: 999 },
  { slug: 'go-west',      name: 'Go West',       amount: 999 },
  { slug: 'the-business', name: 'The Business',  amount: 999 },
  { slug: 'due-south',    name: 'Due South',     amount: 999 },
]

for (const pub of publications) {
  const existing = await prisma.publication.findUnique({ where: { slug: pub.slug } })
  if (!existing) { console.log(`Skipping ${pub.slug} — not in DB`); continue }

  const product = await stripe.products.create({
    name: `${pub.name} — Annual Subscription`,
    metadata: { slug: pub.slug },
  })
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: pub.amount,
    currency: 'eur',
    recurring: { interval: 'year' },
  })

  await prisma.publication.update({
    where: { slug: pub.slug },
    data: { stripePriceId: price.id },
  })

  console.log(`✓ ${pub.name}: ${price.id}`)
}

await prisma.$disconnect()
console.log('Done!')