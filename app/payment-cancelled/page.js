export default function PaymentCancelledPage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
          <p className="text-sm text-gray-500">No charge was made. Contact us if you'd like to complete this payment.</p>
        </div>
      </div>
    )
  }