import { stripe } from '@/lib/stripe'

export default async function PaymentSuccessPage({ searchParams }) {
  const { session_id } = await searchParams

  let session = null
  if (session_id) {
    try {
      session = await stripe.checkout.sessions.retrieve(session_id)
    } catch (err) {
      session = null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-green-600 text-2xl">✓</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Received</h1>
        <p className="text-sm text-gray-500 mb-1">
          {session
            ? `Thank you${session.metadata?.advertiserName ? `, ${session.metadata.advertiserName}` : ''}. We've received your payment.`
            : "Thank you. We've received your payment."}
        </p>
        <p className="text-xs text-gray-400 mt-4">A confirmation email has been sent to you.</p>
      </div>
    </div>
  )
}