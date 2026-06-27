import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendRenewalReminderEmail({ to, name, publicationTitle, expiresAt, renewUrl }) {
  const expiryDate = new Date(expiresAt).toLocaleDateString('en-IE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  await transporter.sendMail({
    from: `"Mara Media" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your ${publicationTitle} subscription expires in 7 days`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0f1923; color: #ffffff; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #ffffff; font-size: 24px; margin: 0;">Mara Media</h1>
        </div>
        <h2 style="color: #ffffff; font-size: 20px;">Hi ${name},</h2>
        <p style="color: #9ca3af; line-height: 1.6;">
          Your <strong style="color: #ffffff;">${publicationTitle}</strong> subscription expires on
          <strong style="color: #ffffff;">${expiryDate}</strong>.
        </p>
        <p style="color: #9ca3af; line-height: 1.6;">
          Renew now to keep reading without interruption.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${renewUrl}" style="background: #1C3664; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Renew Subscription →
          </a>
        </div>
        <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 32px;">
          Manage your subscriptions at your
          <a href="${process.env.NEXTAUTH_URL}/account" style="color: #6b7280;">account page</a>.
        </p>
      </div>
    `,
  })
}