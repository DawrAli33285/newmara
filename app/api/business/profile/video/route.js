import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'business') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video.' }, { status: 400 })
    }
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 100MB.' }, { status: 400 })
    }

    const businessProfile = await prisma.businessProfile.findFirst({
      where: { business: { email: session.user.email } },
    })

    if (!businessProfile) {
      return NextResponse.json({ error: 'Business profile not found.' }, { status: 404 })
    }

    const ext = file.name.split('.').pop()
    const path = `${businessProfile.id}/promo-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('promo-videos')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from('promo-videos').getPublicUrl(path)

    return NextResponse.json({ promoVideoUrl: urlData.publicUrl })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}