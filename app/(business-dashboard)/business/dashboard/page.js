import Link from "next/link";
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";

const OFFER_COLORS = ["#2f7d1b", "#e5a93d", "#1c3664", "#b04468", "#7c5aa6"];

async function getDashboardData() {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/business/dashboard`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (res.status === 401) return { unauthorized: true };
  if (!res.ok) return null;

  return res.json();
}

function ActivityChart({ activityData }) {
  const width = 720;
  const height = 220;
  const left = 38;
  const bottom = 32;
  const plotWidth = width - left - 12;
  const plotHeight = height - 12 - bottom;
  const max = 350;

  const getPoints = (key) => {
    return activityData
      .map((item, index) => {
        const x = left + (index / (activityData.length - 1)) * plotWidth;
        const y = 12 + plotHeight - (item[key] / max) * plotHeight;

        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Daily business activity"
    >
      {[0, 100, 200, 300].map((value) => {
        const y = 12 + plotHeight - (value / max) * plotHeight;

        return (
          <g key={value}>
            <line x1={left} x2={width - 12} y1={y} y2={y} stroke="#e8edf0" />

            <text
              x={left - 9}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#94a3b8"
            >
              {value}
            </text>
          </g>
        );
      })}

      {activityData.map((item, index) => {
        const x = left + (index / (activityData.length - 1)) * plotWidth;

        return (
          <text
            key={item.day}
            x={x}
            y={height - 8}
            textAnchor="middle"
            fontSize="11"
            fill="#94a3b8"
          >
            {item.day}
          </text>
        );
      })}

      <polyline
        points={getPoints("profile")}
        fill="none"
        stroke="#2f7d1b"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <polyline
        points={getPoints("website")}
        fill="none"
        stroke="#1c3664"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <polyline
        points={getPoints("advert")}
        fill="none"
        stroke="#e5a93d"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}


export default async function BusinessDashboardPage() {
  const data = await getDashboardData();

  if (!data || data.unauthorized) {
    redirect("/business/login");
  }

  if (!data.hasDigitalPartner) {
    if (data.hasAdvertiser) {
      redirect("/business/advertiserdashboard");
    }
    if (data.hasDirectoryListing) {
      redirect("/business/listingdashboard");
    }
    redirect("/business/select-plan");
  }

  const {
    businessName,
    isDigitalPartnerAndAdvertiser,
    metrics,
    activityData,
    actionBreakdown,
    offers: rawOffers,
    latestIssue,
  } = data;

  const offers = rawOffers.map((offer, i) => ({
    ...offer,
    color: OFFER_COLORS[i % OFFER_COLORS.length],
  }));

  const maxOfferValue = Math.max(...offers.map((o) => o.views), 1);
  const maxActionValue = Math.max(...actionBreakdown.map((a) => a.value), 1);

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-5 sm:p-8">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7d1b]">
          Business overview
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Good morning, {businessName}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your Mara Media presence and advertising pages.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs text-slate-500">Profile views</p>

    <p className="mt-3 text-3xl font-bold">{metrics.profileViews.toLocaleString()}</p>
  </div>

  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs text-slate-500">Offer redemptions</p>

    <p className="mt-3 text-3xl font-bold">
      {offers.reduce((sum, o) => sum + o.actions, 0)}
    </p>
  </div>

  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs text-slate-500">Public profile</p>

    <p className="mt-3 text-3xl font-bold text-[#2f7d1b]">Live</p>
  </div>
</section>
{isDigitalPartnerAndAdvertiser && (
  <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7d1b]">
            Your publication feature
          </p>

          <h2 className="mt-2 text-xl font-bold">
            {latestIssue
              ? `${latestIssue.publicationTitle} — ${latestIssue.issueTitle}`
              : "No feature yet"}
          </h2>

          {latestIssue && (
            <p className="mt-1 text-sm text-slate-500">
              {latestIssue.publicationTitle} · Issue {latestIssue.issueNumber}
            </p>
          )}
        </div>

        {latestIssue && (
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              latestIssue.isPublished
                ? "bg-green-50 text-green-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {latestIssue.isPublished ? "Published" : "Draft"}
          </span>
        )}
      </div>

      {latestIssue ? (
        <div className="mt-7 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-400">Pages</p>

            <p className="mt-1 font-semibold">
              {latestIssue.pageCount ? `${latestIssue.pageCount} pages` : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Updated</p>

            <p className="mt-1 font-semibold">
              {new Date(latestIssue.publishedAt).toLocaleDateString("en-IE", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="sm:text-right">
            <Link
              href="/business/adpage"
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#1c3664] px-4 text-xs font-bold text-white hover:bg-[#13294d]"
            >
              Open Ad Page →
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-7 border-t border-slate-100 pt-5">
          <p className="text-sm text-slate-500">
            You don't have a published issue yet.
          </p>
          <Link
            href="/business/adpage"
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-[#1c3664] px-4 text-xs font-bold text-white hover:bg-[#13294d]"
          >
            Set up your ad page →
          </Link>
        </div>
      )}
    </div>

    <div className="rounded-xl bg-[#0b1830] p-6 text-white shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b9e757]">
        Quick actions
      </p>

      <h2 className="mt-3 font-serif text-3xl font-normal">
        Make your page work harder.
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-300">
        Add a clickable link or video to any live issue and help readers
        take the next step.
      </p>

      <Link
        href="/business/adpage"
        className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-[#b9e757] px-4 text-sm font-bold text-[#152313] hover:bg-[#c8f36d]"
      >
        Manage Ad Page →
      </Link>
    </div>
  </section>
)}


<section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7d1b]">
        Portal access
      </p>

      <h2 className="mt-2 text-xl font-bold">Your business tools</h2>
    </div>

    {isDigitalPartnerAndAdvertiser && (
      <Link
        href="/business/adpage"
        className="text-xs font-bold text-[#2f7d1b] hover:text-[#246515]"
      >
        Go to Ad Page →
      </Link>
    )}
  </div>

  <div className="mt-6 grid gap-3 sm:grid-cols-3">
    {isDigitalPartnerAndAdvertiser && (
      <Link
        href="/business/adpage"
        className="rounded-lg border border-slate-200 p-4 transition hover:border-[#2f7d1b] hover:bg-green-50"
      >
        <span className="text-2xl">▤</span>

        <h3 className="mt-3 text-sm font-bold">Ad Page</h3>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Select a publication and issue.
        </p>
      </Link>
    )}

    <Link
      href="/business/businessprofile"
      className="rounded-lg border border-slate-200 p-4 transition hover:border-[#2f7d1b] hover:bg-green-50"
    >
      <span className="text-2xl">♙</span>

      <h3 className="mt-3 text-sm font-bold">Business profile</h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        Manage your public business information.
      </p>
    </Link>

    <Link
      href="/business/offers"
      className="rounded-lg border border-slate-200 p-4 transition hover:border-[#2f7d1b] hover:bg-green-50"
    >
      <span className="text-2xl">✦</span>

      <h3 className="mt-3 text-sm font-bold">Offers</h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        Manage offers shown to readers.
      </p>
    </Link>
  </div>
</section>
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#2f7d1b]">
              Performance
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#0b1830]">
              How readers find you
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Last 6 days
            </p>
          </div>

         
        </div>

       
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Profile views</p>
            <p className="mt-2 text-3xl font-bold text-[#0b1830]">
              {metrics.profileViews.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Advert clicks</p>
            <p className="mt-2 text-3xl font-bold text-[#0b1830]">
              {metrics.advertClicks.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Website clicks</p>
            <p className="mt-2 text-3xl font-bold text-[#0b1830]">
              {metrics.websiteClicks.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-500">Enquiries</p>
            <p className="mt-2 text-3xl font-bold text-[#0b1830]">
              {metrics.enquiriesCount}
            </p>
            <p className="mt-2 text-xs font-semibold text-[#2f7d1b]">
              This month
            </p>
          </div>

   
        <div className="grid">
          
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="font-bold text-[#0b1830]">Action breakdown</h3>

            <p className="mt-1 text-xs text-slate-500">
              What readers did after visiting
            </p>

            <div className="mt-6 space-y-4">
              {actionBreakdown.length === 0 && (
                <p className="text-sm text-slate-500">No activity yet.</p>
              )}
              {actionBreakdown.map((item, i) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-medium text-slate-600">{item.label}</span>

                    <span className="font-bold text-[#0b1830]">{item.value}</span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(item.value / maxActionValue) * 100}%`,
                        backgroundColor: OFFER_COLORS[i % OFFER_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

       
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="font-bold text-[#0b1830]">Offer engagement</h3>

          <p className="mt-1 text-xs text-slate-500">
            Views vs actions per offer
          </p>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {offers.length === 0 && (
              <p className="text-sm text-slate-500">No live offers yet.</p>
            )}
            {offers.map((offer) => (
              <div key={offer.id}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    {offer.name}
                  </span>

                  <span className="text-slate-400">
                    {offer.views > 0 ? Math.round((offer.actions / offer.views) * 100) : 0}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div
                    className="h-3 rounded-r-full bg-slate-200"
                    style={{
                      width: `${(offer.views / maxOfferValue) * 100}%`,
                    }}
                  />

                  <div
                    className="h-3 rounded-r-full"
                    style={{
                      width: `${(offer.actions / maxOfferValue) * 100}%`,
                      backgroundColor: offer.color,
                    }}
                  />
                </div>

                <div className="mt-2 flex gap-3 text-[11px] text-slate-400">
                  <span>{offer.views} views</span>
                  <span>{offer.actions} actions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
