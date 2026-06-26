import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import CreatePaymentLinkForm from './CreatePaymentLinkForm'
import CopyButton from './CopyButton'

export default async function AdvertisersPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (user?.role !== 'admin') redirect('/')

  const publications = await prisma.publication.findMany({ orderBy: { title: 'asc' } })

  const payments = await prisma.advertiserPayment.findMany({
    include: { publication: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amountCents, 0)

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amountCents, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Advertiser Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Generate deposit links and track payment status</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Payments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{payments.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Total Paid</p>
            <p className="text-2xl font-bold text-green-700 mt-1">€{(totalPaid / 100).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Pending</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">€{(totalPending / 100).toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-bold text-gray-900 mb-4">Create Payment Link</h2>
              <CreatePaymentLinkForm publications={publications} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">All Payments ({payments.length})</h2>
              </div>

              {payments.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm">
                  No payments yet. Create a link to get started.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {payments.map((payment) => (
                    <div key={payment.id} className="px-6 py-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 text-sm truncate">{payment.advertiserName}</p>
                            <StatusBadge status={payment.status} />
                          </div>
                          <p className="text-xs text-gray-500 truncate">{payment.advertiserEmail}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{payment.publication.title}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-gray-900 text-sm">€{(payment.amountCents / 100).toFixed(2)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(payment.createdAt).toLocaleDateString('en-IE')}
                          </p>
                          {payment.paymentUrl && (
                            <CopyButton url={payment.paymentUrl} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    paid:    'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    failed:  'bg-red-100 text-red-700',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}