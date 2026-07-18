import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import TogglePublished from "./TogglePublished";
import CoverUpload from "./CoverUpload";
import DeleteIssue from "./DeleteIssue";

export default async function PublicationDetailPage({ params }) {
  const { slug } = await params;
  const publication = await prisma.publication.findUnique({
    where: { slug },
    include: { issues: { orderBy: { issueNumber: "desc" } } },
  });

  if (!publication) return notFound();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/publications"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {publication.title}
          </h1>
        </div>
        <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Publication Cover
          </p>
          <CoverUpload
            publicationId={publication.id}
            currentCover={publication.coverImageUrl}
          />
        </div>
        <Link
          href="/publications/upload"
          className="bg-[#1C3664] text-white px-4 py-2 rounded-lg text-sm"
        >
          + Upload New Issue
        </Link>
      </div>

      {publication.issues.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">No issues uploaded yet.</p>
          <Link
            href="/publications/upload"
            className="bg-[#1C3664] text-white px-4 py-2 rounded-lg text-sm"
          >
            Upload First Issue
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  #
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  Title
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {publication.issues.map((issue) => (
                <tr key={issue.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{issue.issueNumber}</td>
                  <td className="px-6 py-4">{issue.title}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(issue.publishedAt).toLocaleDateString("en-IE")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issue.isPublished
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {issue.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <a
                      href={`/read/${publication.slug}?issue=${issue.id}`}
                      target="_blank"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Preview Flipbook
                    </a>
                    <Link
                      href={`/publications/${publication.slug}/issues/${issue.id}/overlays`}
                      className="text-purple-600 hover:underline text-xs"
                    >
                      add sale pdf
                    </Link>
                    <TogglePublished
                      issueId={issue.id}
                      isPublished={issue.isPublished}
                    />
                    <DeleteIssue issueId={issue.id} issueTitle={issue.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}