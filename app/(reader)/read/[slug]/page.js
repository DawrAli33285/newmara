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

  if (user?.role !== 'admin') {
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

  const awaitedSearch = await searchParams
  const selectedIssueId = awaitedSearch?.issue || publication.issues[0].id
  const selectedIssue = publication.issues.find(i => i.id === selectedIssueId) || publication.issues[0]

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="font-bold text-gray-900">{publication.title}</h1>
            <p className="text-sm text-gray-500">{selectedIssue.title}</p>
            <a href="/" className="text-sm text-gray-400 hover:text-gray-700 transition">Home</a>
          </div>
        </div>
        <BackButton />
      </div>

      {publication.issues.length > 1 && (
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex gap-2 overflow-x-auto">
          {publication.issues.map((issue) => (
            <a
              key={issue.id}
              href={`/read/${slug}?issue=${issue.id}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
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

      <div className="py-10 px-4">
        <FlipbookWrapper pdfUrl={selectedIssue.pdfUrl} title={selectedIssue.title} />
      </div>
    </div>
  )
}