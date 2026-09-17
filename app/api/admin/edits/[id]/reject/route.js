
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized.' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { rejectionReason, type } = body

    if (!rejectionReason) {
      return NextResponse.json({ error: 'rejectionReason is required.' }, { status: 400 })
    }

    if (type === 'directory_listing_edit') {
      const edit = await prisma.directoryListingEdit.findUnique({ where: { id } })

      if (!edit) {
        return NextResponse.json({ error: 'Edit not found.' }, { status: 404 })
      }

      if (edit.status !== 'submitted' && edit.status !== 'pending') {
        return NextResponse.json({ error: 'Only pending edits can be rejected.' }, { status: 409 })
      }

   
     const updated = await prisma.directoryListingEdit.update({
      where: { id },
      data: {
        status: 'denied',
        reviewedAt: new Date(),
        reviewedBy: session.user.email,
        rejectionReason,
      },
    })

    await prisma.auditLog.create({
      data: {
        actor: session.user.email,
        action: 'moved to "denied"',
        recordLabel: `Directory listing edit: ${id}`,
      },
    })

    return NextResponse.json({ success: true, edit: updated })
  }

  const edit = await prisma.businessProfileEdit.findUnique({ where: { id } })

  if (!edit) {
    return NextResponse.json({ error: 'Edit not found.' }, { status: 404 })
  }

  if (edit.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending edits can be rejected.' }, { status: 409 })
  }

  const updated = await prisma.businessProfileEdit.update({
    where: { id },
    data: {
      status: 'denied',
      reviewedAt: new Date(),
      reviewedBy: session.user.email,
      rejectionReason,
    },
  })

  await prisma.auditLog.create({
    data: {
      actor: session.user.email,
      action: 'moved to "denied"',
      recordLabel: `Business profile update: ${id}`,
    },
  })

  return NextResponse.json({ success: true, edit: updated })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}