import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req, { params }) {
  const { id } = await params
  const formData = await req.formData()
  const file = formData.get('cover')

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const publication = await prisma.publication.findUnique({ where: { id } })
  if (!publication) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const ext = file.name.split('.').pop()
  const path = `${publication.slug}/cover.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from('covers')
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from('covers').getPublicUrl(path)

  await prisma.publication.update({
    where: { id },
    data: { coverImageUrl: data.publicUrl },
  })

  return NextResponse.json({ success: true, url: data.publicUrl })
}