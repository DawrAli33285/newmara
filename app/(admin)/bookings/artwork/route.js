import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)


export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file')
    const bookingId = formData.get('bookingId') || 'unfiled'

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    const isImage = file.type.startsWith('image/')
    const isPdf = file.type === 'application/pdf'
    if (!isImage && !isPdf) {
      return NextResponse.json(
        { error: 'File must be an image or a PDF.' },
        { status: 400 }
      )
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 25MB.' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()
    const path = `${bookingId}/artwork-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('artwork')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      return NextResponse.json(
        { error: 'Upload failed: ' + uploadError.message },
        { status: 500 }
      )
    }

    const { data: urlData } = supabase.storage.from('artwork').getPublicUrl(path)

    return NextResponse.json({
      artworkUrl: urlData.publicUrl,
      fileName: file.name,
      fileType: file.type,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}