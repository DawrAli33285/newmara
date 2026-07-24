import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Navbar from '@/components/navbar'

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      subscriptions: {
        where: { status: 'active' },
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

  const activeSubscriptions = user.subscriptions

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
        <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">

        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#0B1830]">My Library</h1>
          <p className="text-sm text-[#657084] mt-2">Your active publications and latest issues</p>
        </div>

        {activeSubscriptions.length === 0 ? (
          <div className="bg-white border border-[#D9E0E7] rounded-2xl p-12 text-center">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
        )}

        <div className="bg-white border border-[#D9E0E7] rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[#0B1830] font-semibold text-sm">Want more publications?</p>
            <p className="text-[#657084] text-xs mt-0.5">Subscribe to any of our 5 titles for full archive access</p>
          </div>
          
           <a href="/browse"
            className="shrink-0 bg-[#EFF5EE] hover:bg-[#e3ede1] text-[#2F7D1B] text-sm font-semibold px-5 py-2.5 rounded-xl transition"
          >
            Browse →
          </a>
        </div>

      </div>
    </div>
  )
}