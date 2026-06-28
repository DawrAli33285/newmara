import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PublishToggle from './PublishToggle'

export default async function PublicationsPage() {
  const publications = await prisma.publication.findMany({
    include: { _count: { select: { issues: true } } },
    orderBy: { title: 'asc' },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Publications</h1>
        <Link
          href="/publications/upload"
          className="bg-[#1C3664] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-900"
        >
          + Upload New Issue
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {publications.map((pub) => (
          <div key={pub.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {pub.coverImageUrl ? (
              <img src={pub.coverImageUrl} alt={pub.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-[#1C3664] flex items-center justify-center">
                <span className="text-white text-xl font-bold text-center px-4">{pub.title}</span>
              </div>
            )}
            <div className="p-4">
              <h2 className="font-semibold text-gray-900">{pub.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {pub._count.issues} issue{pub._count.issues !== 1 ? 's' : ''}
              </p>
              <Link
                href={`/publications/${pub.slug}`}
                className="mt-3 block text-center bg-gray-100 text-gray-700 text-sm py-2 rounded-lg hover:bg-gray-200"
              >
                View Issues
              </Link>
              <PublishToggle id={pub.id} isPublished={pub.isPublished} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}