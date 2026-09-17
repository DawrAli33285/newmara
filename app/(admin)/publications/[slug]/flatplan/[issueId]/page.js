import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import FlatPlanBoard from "@/components/FlatPlanBoard";
import AdReviewPanel from "@/components/AdReviewPanel";

export const dynamic = "force-dynamic";

export default async function AdminFlatPlanPage({ params }) {
  const { slug, issueId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: { publication: true },
  });

  if (!issue || issue.publication.slug !== slug) {
    return notFound();
  }

  const advertisers = await prisma.advertiser.findMany({
    orderBy: { advertiserName: "asc" },
    select: { id: true, advertiserName: true, telephone: true },
  });

  const packages = await prisma.printPackage.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const pendingAdCount = await prisma.ad.count({
    where: { publicationId: issue.publicationId, status: "pending" },
  });

  return (
    <div className="min-h-screen bg-gray-50 text-[#0b1830]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
          <Link
            href={`/publications/${slug}/issues`}
            className="text-sm text-gray-500 hover:text-[#2f7d1b]"
          >
            ← {issue.publication.title} issues
          </Link>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7d1b]">
                Flat plan
              </p>
              <h1 className="mt-2 text-3xl font-bold">{issue.title}</h1>
              <p className="mt-1 text-sm text-gray-500">
                {issue.publication.title} · Issue {issue.issueNumber} ·{" "}
                {issue.totalPages || 0} pages
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-5 sm:p-8 space-y-8">
        <AdReviewPanel
          publicationId={issue.publicationId}
          publicationTitle={issue.publication.title}
          initialPendingCount={pendingAdCount}
        />

        <FlatPlanBoard
          issueId={issue.id}
          totalPages={issue.totalPages || 0}
          publicationId={issue.publicationId}
          advertisers={advertisers}
          packages={packages}
        />
      </main>
    </div>
  );
}