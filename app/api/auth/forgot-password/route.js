import { NextResponse } from 'next/server'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { prisma } from '@/lib/prisma'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const LOGO_URL =
  'https://res.cloudinary.com/dbjwbveqn/image/upload/v1788288190/logo_sgvhbv.webp'

export async function POST(req) {
  try {
    const { email } = await req.json()
    console.log('[forgot-password] request received for:', email)

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    console.log('[forgot-password] user found:', !!user)

    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60) 

      await prisma.passwordResetToken.deleteMany({ where: { email } })
      await prisma.passwordResetToken.create({
        data: { email, token, expiresAt },
      })
      console.log('[forgot-password] reset token created, expires:', expiresAt)

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
      console.log('[forgot-password] reset URL:', resetUrl)

      try {
        const info = await transporter.sendMail({
          from: `"Mara Media" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Reset your Mara Media password',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
              <div style="text-align:center; padding: 16px 0;">
                <img src="${LOGO_URL}" alt="Mara Media" style="height:36px; width:auto;" />
              </div>

              <h2 style="color: #1a3460;">Reset your password</h2>
              <p>Click the button below to reset your password. This link expires in 1 hour.</p>
              <a href="${resetUrl}"
                 style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0;">
                Reset Password
              </a>
              <p style="color:#666;font-size:14px;">If you didn't request this, ignore this email.</p>
            </div>
          `,
        })
        console.log('[forgot-password] email sent successfully:', info.messageId, info.response)
      } catch (mailErr) {
        console.error('[forgot-password] FAILED to send email:', mailErr)
      }
    } else {
      console.log('[forgot-password] no user with that email, skipping send')
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[forgot-password] unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}