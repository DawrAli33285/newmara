import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import OverlayEditor from './OverlayEditor'

export default async function IssueOverlaysPage({ params }) {
  const { slug, issueId } = await params

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { publication: true },
  })

  if (!issue || issue.publication.slug !== slug) return notFound()

  return (
    <div className="p-8">
      <Link
        href={`/publications/${slug}`}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to {issue.publication.title}
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-6">
        {issue.title} — Links &amp; Videos
      </h1>

      <OverlayEditor issueId={issue.id} pdfUrl={issue.pdfUrl} />
    </div>
  )
}
