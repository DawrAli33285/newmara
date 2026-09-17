
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
      const body = await req.json().catch(() => ({}))
      const type = body.type || 'profile_edit'

      if (type === 'directory_listing_edit') {
        const edit = await prisma.directoryListingEdit.findUnique({ where: { id } })

        if (!edit) {
          return NextResponse.json({ error: 'Edit not found.' }, { status: 404 })
        }

        if (edit.status !== 'submitted' && edit.status !== 'pending') {
          return NextResponse.json({ error: 'Only pending edits can be approved.' }, { status: 409 })
        }

       
       const result = await prisma.$transaction([
        prisma.directoryListing.update({
          where: { id: edit.directoryListingId },
          data: edit.changes,
        }),
        prisma.directoryListingEdit.update({
          where: { id },
          data: {
            status: 'approved',
            reviewedAt: new Date(),
            reviewedBy: session.user.email,
          },
        }),
      ])

      await prisma.auditLog.create({
        data: {
          actor: session.user.email,
          action: 'moved to "approved"',
          recordLabel: `Directory listing edit: ${id}`,
        },
      })

      return NextResponse.json({ success: true, directoryListing: result[0], edit: result[1] })
      }

      const edit = await prisma.businessProfileEdit.findUnique({ where: { id } })

      if (!edit) {
        return NextResponse.json({ error: 'Edit not found.' }, { status: 404 })
      }

      if (edit.status !== 'pending') {
        return NextResponse.json({ error: 'Only pending edits can be approved.' }, { status: 409 })
      }

  
     const result = await prisma.$transaction([
      prisma.businessProfile.update({
        where: { id: edit.businessProfileId },
        data: edit.changes,
      }),
      prisma.businessProfileEdit.update({
        where: { id },
        data: {
          status: 'approved',
          reviewedAt: new Date(),
          reviewedBy: session.user.email,
        },
      }),
    ])

    await prisma.auditLog.create({
      data: {
        actor: session.user.email,
        action: 'moved to "approved"',
        recordLabel: `Business profile update: ${id}`,
      },
    })

    return NextResponse.json({ success: true, businessProfile: result[0], edit: result[1] })
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }
  }