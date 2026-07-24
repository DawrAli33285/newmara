import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.publication.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Publication not found' }, { status: 404 })
    }

    const data = {}

    if ('isPublished' in body) {
      data.isPublished = body.isPublished
    }

    if ('title' in body) {
      if (!body.title || !body.title.trim()) {
        return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
      }
      data.title = body.title.trim()
    }

    if ('description' in body) {
      data.description = body.description?.trim() || null
    }
    if ('price' in body) {
      const price = parseFloat(body.price)
      if (isNaN(price) || price < 1) {
        return NextResponse.json({ error: 'A valid price is required.' }, { status: 400 })
      }

      if (existing.stripePriceId) {
        const currentPrice = await stripe.prices.retrieve(existing.stripePriceId)
        const productId = currentPrice.product


        const newAmount = Math.round(price * 100)
        if (currentPrice.unit_amount !== newAmount) {
          const newPrice = await stripe.prices.create({
            product: productId,
            unit_amount: newAmount,
            currency: currentPrice.currency || 'eur',
            recurring: { interval: currentPrice.recurring?.interval || 'month' },
          })
          await stripe.prices.update(existing.stripePriceId, { active: false })
          data.stripePriceId = newPrice.id
        }
      } else {

        const product = await stripe.products.create({
          name: data.title || existing.title,
          description: data.description ?? existing.description ?? undefined,
        })
        const newPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(price * 100),
          currency: 'eur',
          recurring: { interval: 'month' },
        })
        data.stripePriceId = newPrice.id
      }
    }

    const publication = await prisma.publication.update({
      where: { id },
      data,
    })

    return NextResponse.json(publication)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params

    await prisma.$transaction([
      prisma.subscription.deleteMany({ where: { publicationId: id } }),
      prisma.issueView.deleteMany({ where: { issue: { publicationId: id } } }),
      prisma.pageView.deleteMany({ where: { issue: { publicationId: id } } }),
      prisma.pageOverlay.deleteMany({ where: { issue: { publicationId: id } } }),
      prisma.issue.deleteMany({ where: { publicationId: id } }),
      prisma.publication.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}