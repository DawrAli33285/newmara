import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and new password are required.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has already been used.' },
        { status: 400 }
      )
    }

    if (resetToken.expiresAt < new Date()) {
      // Clean up the expired token so it can't be retried
      await prisma.passwordResetToken.delete({ where: { token } })
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    const business = await prisma.business.findUnique({
      where: { email: resetToken.email },
    })

    if (!business) {
      // Token was issued for an email with no matching business account
      // (e.g. account deleted after the link was sent).
      await prisma.passwordResetToken.delete({ where: { token } })
      return NextResponse.json(
        { error: 'This reset link is invalid or has already been used.' },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.business.update({
      where: { id: business.id },
      data: { passwordHash },
    })

    // Invalidate the token immediately so it can't be replayed
    await prisma.passwordResetToken.delete({ where: { token } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[business/reset-password/confirm] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}