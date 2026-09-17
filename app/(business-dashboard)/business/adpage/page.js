import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function BusinessAdPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.accountType !== "business") {
    redirect("/login");
  }

  const advertiser = await prisma.advertiser.findUnique({
    where: { businessId: session.user.id },
    select: { id: true },
  });

  const publications = await prisma.publication.findMany({
    orderBy: { title: "asc" },
    include: advertiser
      ? {
          ads: {
            where: { advertiserId: advertiser.id },
            select: { id: true, status: true },
          },
        }
      : undefined,
  });

  return (
    <div className="min-h-screen bg-gray-50 text-[#0b1830]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <div>
            <Link
              href="/business/dashboard"
              className="text-sm text-gray-500 hover:text-[#2f7d1b]"
            >
              ← Business dashboard
            </Link>

            <h1 className="mt-1 text-2xl font-bold">
              Ads
            </h1>
          </div>

          <Link
            href="/business"
            className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:border-[#2f7d1b] hover:text-[#2f7d1b]"
          >
            View public page
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-5 sm:p-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7d1b]">
            Choose a publication
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Manage your ads
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Select a publication to view the ads you&apos;ve submitted for it,
            or add a new one. Ads are reviewed by the Mara Media team before
            they become available for readers to unlock.
          </p>
        </div>

        {!advertiser && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            Your business account isn&apos;t linked to an advertiser profile
            yet, so you can&apos;t submit ads. Please contact your account
            manager.
          </div>
        )}

        {publications.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
            No publications are available yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {publications.map((publication) => {
              const ads = publication.ads || [];
              const pendingCount = ads.filter((a) => a.status === "pending").length;
              const approvedCount = ads.filter((a) => a.status === "approved").length;

              return (
                <article
                  key={publication.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {publication.coverImageUrl ? (
                    <img
                      src={publication.coverImageUrl}
                      alt={publication.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-[#0b1830] px-6 text-center text-xl font-bold text-white">
                      {publication.title}
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold">
                        {publication.title}
                      </h3>

                      <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500">
                        {ads.length} {ads.length === 1 ? "ad" : "ads"}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {ads.length === 0
                        ? "You haven't submitted any ads for this publication yet."
                        : `${approvedCount} approved · ${pendingCount} pending`}
                    </p>

                    <Link
                      href={`/business/adpage/${publication.slug}`}
                      className="mt-5 flex min-h-11 items-center justify-center rounded-lg bg-[#1c3664] text-sm font-bold text-white transition hover:bg-[#13294d]"
                    >
                      Manage ads →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}