import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CancelSubscriptionButton from './CancelSubscriptionButton'
import Navbar from '@/components/navbar'

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        include: {
          publication: {
            include: {
              issues: {
                where: { isPublished: true },
                orderBy: { publishedAt: 'desc' },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!user) redirect('/login')

  const activeSubscriptions = user.subscriptions.filter(s => s.status === 'active')

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">

        <div className="mb-10">
          <p className="text-sm text-[#657084] mb-1">Welcome back</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0B1830]">{session.user.email}</h1>
          <p className="text-sm text-[#657084] mt-2">
            Member since {new Date(user.createdAt).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="mb-8">
        <a href="/browse" className="inline-block bg-[#2F7D1B] hover:bg-[#256516] text-white font-semibold px-6 py-3 rounded-xl text-sm transition">
                Browse Publications
              </a>
          {/* <h1 className="text-md font-bold text-[#657084] uppercase tracking-widest mb-4">My Library</h1>
          <h2 className='text-sm font-bold text-black uppercase tracking-widest mb-4'>Access all your subscribed publications in one place.</h2> */}
          {/* {activeSubscriptions.length === 0 ? (
            <div className="bg-white border border-[#D9E0E7] rounded-2xl p-10 text-center">
              <div className="w-12 h-12 rounded-full bg-[#EFF5EE] flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2F7D1B" strokeWidth="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <p className="text-[#0B1830] font-semibold mb-1">Your library is empty</p>
              <p className="text-sm text-[#657084] mb-6">Subscribe to a publication to start reading</p>
              <a href="/browse" className="inline-block bg-[#2F7D1B] hover:bg-[#256516] text-white font-semibold px-6 py-3 rounded-xl text-sm transition">
                Browse Publications
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSubscriptions.map((sub) => {
                const pub = sub.publication
                const latestIssue = pub.issues[0]

                return (
                  <div key={sub.id} className="bg-white border border-[#D9E0E7] rounded-2xl overflow-hidden flex flex-col">
                    <div className="aspect-[3/4] bg-[#081B31]">
                      {pub.coverImageUrl && (
                        <img src={pub.coverImageUrl} alt={pub.title} className="w-full h-full object-cover" />
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-[#0B1830] font-bold mb-1">{pub.title}</h3>
                      <p className="text-xs text-[#657084] mb-4">
                        {latestIssue ? `Latest: ${latestIssue.title}` : 'No issues published yet'}
                      </p>

                      <a href={`/read/${pub.slug}`}
                        className="mt-auto text-center bg-[#2F7D1B] hover:bg-[#256516] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition"
                      >
                        Continue Reading
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )} */}
        </div>

        {user.subscriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-bold text-[#657084] uppercase tracking-widest mb-4">Subscriptions &amp; Billing</h2>

            <div className="bg-white border border-[#D9E0E7] rounded-2xl divide-y divide-[#D9E0E7]">
              {user.subscriptions.map((sub) => {
                const isActive = sub.status === 'active'
                const daysLeft = sub.currentPeriodEnd
                  ? Math.ceil((new Date(sub.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <div key={sub.id} className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-[#0B1830] font-semibold">{sub.publication.title}</p>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-[#EFF5EE] text-[#2F7D1B]' :
                          sub.status === 'expired' ? 'bg-amber-50 text-amber-700' :
                          'bg-red-50 text-red-600'
                        }`}>
                          {isActive ? 'Active' : sub.status}
                        </span>
                      </div>
                      {isActive && daysLeft !== null ? (
                        <p className="text-xs text-[#657084]">
                          Renews {new Date(sub.currentPeriodEnd).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })} · {daysLeft}d left
                        </p>
                      ) : (
                        <p className="text-xs text-[#657084]">
                          Joined {new Date(sub.createdAt).toLocaleDateString('en-IE')}
                        </p>
                      )}
                    </div>

                    {isActive ? (
                      <CancelSubscriptionButton
                        subscriptionId={sub.id}
                        stripeSubscriptionId={sub.stripeSubscriptionId}
                        publicationTitle={sub.publication.title}
                      />
                    ) : (
                      <a href={`/subscribe/${sub.publication.slug}`}
                        className="text-sm font-semibold text-[#2F7D1B] hover:text-[#256516] transition"
                      >
                        Resubscribe →
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xs font-bold text-[#657084] uppercase tracking-widest mb-4">Account Details</h2>
          <div className="bg-white border border-[#D9E0E7] rounded-2xl divide-y divide-[#D9E0E7]">
            <div className="px-6 py-4 flex justify-between items-center">
              <span className="text-sm text-[#657084]">Email</span>
              <span className="text-sm text-[#0B1830] font-medium">{session.user.email}</span>
            </div>
            <div className="px-6 py-4 flex justify-between items-center">
              <span className="text-sm text-[#657084]">Password</span>
              <a href="/change-password" className="text-sm font-semibold text-[#2F7D1B] hover:text-[#256516] transition">Change password</a>
            </div>
            <div className="px-6 py-4 flex justify-between items-center">
              <span className="text-sm text-[#657084]">Account type</span>
              <span className="text-sm text-[#0B1830] font-medium capitalize">{user.role}</span>
            </div>
          </div>
        </div>

        <a href="/api/auth/signout"
          className="inline-block text-sm font-semibold text-[#657084] hover:text-[#0B1830] transition"
        >
          Sign out
        </a>

      </div>
    </div>
  )
}