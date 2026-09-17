
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const BUCKET = 'offer-images' 

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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WEBP or GIF images are allowed.' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 5MB.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop()
    const path = `${session.user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Upload failed: ' + uploadError.message },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)

    return NextResponse.json({ success: true, url: urlData.publicUrl }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}