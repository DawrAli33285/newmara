import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CancelSubscriptionButton from './CancelSubscriptionButton'

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
  const pastSubscriptions = user.subscriptions.filter(s => s.status !== 'active')

  const styleMap = {
    'the-skipper':  { color: 'from-blue-900 to-blue-700',       emoji: '⚓' },
    'take-off':     { color: 'from-sky-800 to-sky-600',         emoji: '✈️' },
    'go-west':      { color: 'from-emerald-800 to-emerald-600', emoji: '🌿' },
    'the-business': { color: 'from-slate-800 to-slate-600',     emoji: '📈' },
    'due-south':    { color: 'from-amber-800 to-amber-600',     emoji: '🧭' },
  }

  return (
    <div className="min-h-screen bg-[#0f1923]">

      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <a href="/" className="text-white font-bold text-lg tracking-tight">Mara Media</a>
        <a href="/api/auth/signout" className="text-sm text-gray-400 hover:text-white transition">Sign out</a>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">

        <div className="mb-10">
          <p className="text-gray-400 text-sm mb-1">Welcome back</p>
          <h1 className="text-3xl font-bold text-white">{session.user.email}</h1>
          <p className="text-gray-500 text-sm mt-2">
            Member since {new Date(user.createdAt).toLocaleDateString('en-IE', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">My Publications</h2>

          {activeSubscriptions.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-white font-semibold mb-2">No active subscriptions</p>
              <p className="text-gray-400 text-sm mb-6">Subscribe to a publication to get started</p>
              <a
                href="/#publications"
                className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition"
              >
                Browse Publications
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeSubscriptions.map((sub) => {
                const pub = sub.publication
                const style = styleMap[pub.slug] || { color: 'from-gray-800 to-gray-700', emoji: '📖' }
                const latestIssue = pub.issues[0]
                const daysLeft = sub.currentPeriodEnd
                  ? Math.ceil((new Date(sub.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <div key={sub.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition">
                    <div className="flex">
                      <div className="w-28 shrink-0">
                        {pub.coverImageUrl ? (
                          <img
                            src={pub.coverImageUrl}
                            alt={pub.title}
                            className="w-full h-full object-cover"
                            style={{ minHeight: '148px' }}
                          />
                        ) : (
                          <div
                            className={`bg-gradient-to-br ${style.color} h-full flex items-center justify-center`}
                            style={{ minHeight: '148px' }}
                          >
                            <span className="text-3xl">{style.emoji}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-white font-bold">{pub.title}</h3>
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">Active</span>
                          </div>
                          {daysLeft !== null && (
                            <p className="text-xs text-gray-400 mb-1">
                              Renews {new Date(sub.currentPeriodEnd).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' })}
                              <span className="ml-1 text-gray-600">· {daysLeft}d left</span>
                            </p>
                          )}
                          {latestIssue && (
                            <p className="text-xs text-gray-500 mt-0.5">Latest: {latestIssue.title}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                          <a
                            href={`/read/${pub.slug}`}
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                          >
                            Read Now →
                          </a>
                          <CancelSubscriptionButton
                            subscriptionId={sub.id}
                            stripeSubscriptionId={sub.stripeSubscriptionId}
                            publicationTitle={pub.title}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {pastSubscriptions.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Past Subscriptions</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/10">
              {pastSubscriptions.map((sub) => (
                <div key={sub.id} className="px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">{sub.publication.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">Joined {new Date(sub.createdAt).toLocaleDateString('en-IE')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sub.status === 'expired' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {sub.status}
                    </span>
                    <a
                      href={`/subscribe/${sub.publication.slug}`}
                      className="text-xs text-blue-400 hover:text-blue-300 transition"
                    >
                      Resubscribe →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between mb-8">
          <div>
            <p className="text-white font-semibold text-sm">Want more publications?</p>
            <p className="text-gray-400 text-xs mt-0.5">Subscribe to any of our 5 titles for full archive access</p>
          </div>
          <a
            href="/#publications"
            className="shrink-0 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            Browse →
          </a>
        </div>

        <div className="border-t border-white/10 pt-8">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account</h2>
          <div className="bg-white/5 border border-white/10 rounded-xl divide-y divide-white/10">
            <div className="px-5 py-4 flex justify-between items-center">
              <span className="text-gray-400 text-sm">Email</span>
              <span className="text-white text-sm">{session.user.email}</span>
            </div>
            <div className="px-5 py-4 flex justify-between items-center">
              <span className="text-gray-400 text-sm">Password</span>
              <a href="/change-password" className="text-blue-400 hover:text-blue-300 text-sm transition">Change password</a>
            </div>
            <div className="px-5 py-4 flex justify-between items-center">
              <span className="text-gray-400 text-sm">Account type</span>
              <span className="text-white text-sm capitalize">{user.role}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}