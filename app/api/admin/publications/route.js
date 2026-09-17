import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const dynamic = 'force-dynamic'

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function GET() {
  const publications = await prisma.publication.findMany({
    orderBy: { title: 'asc' },
  })
  return NextResponse.json({ publications })
}

export async function POST(req) {
  const formData = await req.formData()
  const title = formData.get('title')
  const description = formData.get('description')
  const price = formData.get('price')
  const isPublished = formData.get('isPublished') === 'true'
  const coverFile = formData.get('cover')

  if (!title) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
  }

  if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 1) {
    return NextResponse.json({ error: 'A valid price is required.' }, { status: 400 })
  }

  const slug = generateSlug(title)

  let stripePriceId = null
  try {
    const product = await stripe.products.create({
      name: title,
      description: description || undefined,
    })

    const stripePrice = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(parseFloat(price) * 100),
      currency: 'eur',
      recurring: { interval: 'month' },
    })

    stripePriceId = stripePrice.id
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create Stripe product: ' + err.message }, { status: 500 })
  }

  let coverImageUrl = null
  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split('.').pop()
    const path = `${slug}/cover.${ext}`
    const buffer = Buffer.from(await coverFile.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(path, buffer, { contentType: coverFile.type, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: 'Cover upload failed: ' + uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('covers').getPublicUrl(path)
    coverImageUrl = urlData.publicUrl
  }

  try {
    const publication = await prisma.publication.create({
      data: {
        title,
        slug,
        description: description || null,
        stripePriceId,
        coverImageUrl,
        isPublished,
      },
    })
    return NextResponse.json(publication)
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'A publication with this slug already exists.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create publication.' }, { status: 500 })
  }
}