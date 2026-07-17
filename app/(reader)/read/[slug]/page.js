import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import FlipbookWrapper from '@/components/FlipbookWrapper'
import BackButton from '@/components/BackButton'

export default async function ReadPage({ params, searchParams }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)

  if (!session) redirect('/login')

  const publication = await prisma.publication.findUnique({
    where: { slug },
    include: {
      issues: {
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' },
      },
    },
  })

  if (!publication) redirect('/')

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  const awaitedSearch = await searchParams

  if (user?.role !== 'admin') {
    if (awaitedSearch?.subscribed === '1') {
      await new Promise((r) => setTimeout(r, 2000))
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: user?.id,
        publicationId: publication.id,
        status: 'active',
      },
    })
    if (!subscription) redirect(`/subscribe/${slug}`)
  }

  if (publication.issues.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{publication.title}</h1>
          <p className="text-gray-500">No issues published yet. Check back soon.</p>
          <a href="/" className="mt-4 inline-block text-blue-600 text-sm hover:underline">← Back to home</a>
        </div>
      </div>
    )
  }

  const selectedIssueId = awaitedSearch?.issue || publication.issues[0].id
  const selectedIssue = publication.issues.find(i => i.id === selectedIssueId) || publication.issues[0]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-2.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bold text-gray-900 text-sm leading-tight">{publication.title}</h1>
            <p className="text-xs text-gray-500 leading-tight">{selectedIssue.title}</p>
          </div>
          <a href="/" className="text-xs text-gray-400 hover:text-gray-700 transition">Home</a>
        </div>
        <BackButton />
      </div>

      {publication.issues.length > 1 && (
        <div className="bg-white border-b border-gray-100 px-6 py-2 flex gap-2 overflow-x-auto sticky top-[45px] z-30">
          {publication.issues.map((issue) => (
            <a
              key={issue.id}
              href={`/read/${slug}?issue=${issue.id}`}
              className={`px-4 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                issue.id === selectedIssue.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {issue.title}
            </a>
          ))}
        </div>
      )}


      <div className="px-2">
        <FlipbookWrapper pdfUrl={selectedIssue.pdfUrl} title={selectedIssue.title} issueId={selectedIssue.id} />
      </div>
    </div>
  )
}