"use client";

import { useState, useEffect, useCallback, useMemo } from "react";


const TABS = [
  { id: "overview", label: "Overview" },
  { id: "engagement", label: "Engagement" },
  { id: "enquiries", label: "Enquiries" },
  { id: "campaigns", label: "Campaign links" },
];

const EVENT_LABELS = {
  profile_view: "Profile views",
  advert_click: "Advert clicks",
  website_click: "Website clicks",
  telephone_click: "Telephone clicks",
  email_click: "Email clicks",
  map_click: "Map / directions clicks",
  offer_view: "Offer views",
  offer_action: "Offer actions",
  video_view: "Video views",
  enquiry_submitted: "Enquiries submitted",
  directory_profile_view: "Directory profile views",
};

const ENQUIRY_STATUS_LABELS = {
  received: "Received",
 
  failed: "Failed",
};

const RANGES = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "all", label: "All time" },
];



function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className}`} />;
}

function EmptyState({ title, subtitle }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
      <p className="text-sm font-semibold text-[#0b1830]">{title}</p>
      {subtitle && <p className="mt-1 max-w-xs text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}

function StatCard({ label, value, delta, loading }) {
  const positive = typeof delta === "number" && delta >= 0;
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-20" />
      ) : (
        <p className="mt-1.5 text-2xl font-bold tracking-tight text-[#0b1830]">
          {value?.toLocaleString?.() ?? value}
        </p>
      )}
      {!loading && typeof delta === "number" && (
        <p
          className={`mt-1.5 inline-flex items-center gap-1 text-xs font-semibold ${
            positive ? "text-[#527323]" : "text-red-500"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className={`h-3 w-3 ${positive ? "" : "rotate-180"}`}
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          {Math.abs(delta)}% vs previous period
        </p>
      )}
    </div>
  );
}

function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h2 className="text-base font-bold text-[#0b1830]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}


function BarList({ data, labelMap = {}, maxItems = 10, valueSuffix = "" }) {
  const items = [...data].sort((a, b) => b.value - a.value).slice(0, maxItems);
  const max = Math.max(...items.map((i) => i.value), 1);

  if (items.length === 0) {
    return <p className="py-6 text-center text-xs text-gray-400">No data for this period.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.key}>
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="font-semibold text-[#0b1830]">{labelMap[item.key] || item.key}</span>
            <span className="text-gray-400">
              {item.value.toLocaleString()}
              {valueSuffix}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[#668b2f]"
              style={{ width: `${Math.max((item.value / max) * 100, 3)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusPill({ status, labelMap }) {
  const styles = {
    received: "bg-gray-100 text-gray-500",
    forwarded_to_ghl: "bg-[#edf5df] text-[#527323]",
  
    failed: "bg-red-50 text-red-600",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
        styles[status] || "bg-gray-100 text-gray-500"
      }`}
    >
      {labelMap[status] || status}
    </span>
  );
}

function RangeSwitcher({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
      {RANGES.map((r) => (
        <button
          key={r.id}
          onClick={() => onChange(r.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === r.id ? "bg-[#0b1830] text-white" : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function PublicationFilter({ publications, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-[#0b1830] focus:border-[#668b2f] focus:outline-none"
    >
      <option value="">All publications</option>
      {publications.map((p) => (
        <option key={p.id} value={p.id}>
          {p.title}
        </option>
      ))}
    </select>
  );
}



function OverviewTab({ data, loading }) {
  const totals = data?.totals;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Profile views" value={totals?.profileViews} delta={totals?.profileViewsDelta} loading={loading} />
        
        <StatCard label="Enquiries" value={totals?.enquiries} delta={totals?.enquiriesDelta} loading={loading} />
        <StatCard label="Active Digital Partners" value={totals?.activeDigitalPartners} loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader title="Top businesses by engagement" subtitle="All event types combined" />
          {loading ? (
            <Skeleton className="h-40" />
          ) : (
            <BarList
              data={(data?.topBusinesses || []).map((b) => ({ key: b.name, value: b.count }))}
            />
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <SectionHeader title="Top publications" subtitle="Events by publication" />
          {loading ? (
            <Skeleton className="h-40" />
          ) : (
            <BarList
              data={(data?.topPublications || []).map((p) => ({ key: p.title, value: p.count }))}
            />
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <SectionHeader title="Enquiry pipeline" subtitle="Reader → Mara Platform → GHL → Business" />
        {loading ? (
          <Skeleton className="h-16" />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Object.entries(data?.enquiryFunnel || {}).map(([status, count]) => (
              <div key={status} className="rounded-xl bg-gray-50 p-4 text-center">
                <p className="text-xl font-bold text-[#0b1830]">{count}</p>
                <div className="mt-1.5 flex justify-center">
                  <StatusPill status={status} labelMap={ENQUIRY_STATUS_LABELS} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



function EngagementTab({ data, loading }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <SectionHeader title="Events by type" subtitle="Business profile, offer and directory interactions" />
        {loading ? (
          <Skeleton className="h-64" />
        ) : (
          <BarList
            data={(data?.eventsByType || []).map((e) => ({ key: e.eventType, value: e.count }))}
            labelMap={EVENT_LABELS}
          />
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-[#0b1830]">Advertiser leaderboard</h2>
          <p className="mt-0.5 text-xs text-gray-400">Ranked by total tracked interactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3 text-center">Profile views</th>
                
                <th className="px-4 py-3 text-center">Offer actions</th>
                <th className="px-4 py-3 text-center">Video views</th>
                <th className="px-4 py-3 text-center">Enquiries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : (data?.leaderboard || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-400">
                    No advertiser activity for this period.
                  </td>
                </tr>
              ) : ((data?.leaderboard || []).map((row) => (
  <tr key={row.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-[#0b1830]">{row.name}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.profileViews}</td>
                   
                    <td className="px-4 py-3 text-center text-gray-600">{row.offerActions}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.videoViews}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.enquiries}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



function EnquiriesTab({ data, loading }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Object.entries(ENQUIRY_STATUS_LABELS).map(([key, label]) => (
          <StatCard
            key={key}
            label={label}
            value={data?.funnel?.[key] ?? 0}
            loading={loading}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-[#0b1830]">Recent enquiries</h2>
         
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <th className="px-4 py-3">Reader</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Publication</th>
                <th className="px-4 py-3 text-center">Consent</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-4 py-3">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : (data?.recent || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-gray-400">
                    No enquiries yet.
                  </td>
                </tr>
              ) : (
                (data?.recent || []).map((eq) => (
                  <tr key={eq.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0b1830]">{eq.name}</p>
                      <p className="text-xs text-gray-400">{eq.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{eq.businessName}</td>
                    <td className="px-4 py-3 text-gray-600">{eq.publicationTitle}</td>
                    <td className="px-4 py-3 text-center">
                      {eq.consentGiven ? (
                        <span className="text-[#527323]">✓</span>
                      ) : (
                        <span className="text-red-500">✕</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusPill status={eq.status} labelMap={ENQUIRY_STATUS_LABELS} />
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                      {new Date(eq.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



function CampaignsTab({ data, loading }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <SectionHeader title="Scans by channel" subtitle="Airport, hotel, social and email campaigns (§13)" />
        {loading ? (
          <Skeleton className="h-48" />
        ) : (
          <BarList data={(data?.byChannel || []).map((c) => ({ key: c.channel, value: c.count }))} />
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-[#0b1830]">Link performance</h2>
          <p className="mt-0.5 text-xs text-gray-400">Scans → resulting engagement events</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Publication</th>
                <th className="px-4 py-3 text-center">Scans</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-4 py-3">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : (data?.links || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-400">
                    No campaign links yet.
                  </td>
                </tr>
              ) : (
                (data?.links || []).map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-[#0b1830]">{link.label}</td>
                    <td className="px-4 py-3 text-gray-600">{link.channel}</td>
                    <td className="px-4 py-3 text-gray-600">{link.publicationTitle || "—"}</td>
                    <td className="px-4 py-3 text-center font-bold text-[#0b1830]">{link.scans}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          link.isActive ? "bg-[#edf5df] text-[#527323]" : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {link.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [range, setRange] = useState("30d");
  const [publicationId, setPublicationId] = useState("");
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabData, setTabData] = useState({});

  const query = useMemo(() => {
    const params = new URLSearchParams({ range });
    if (publicationId) params.set("publicationId", publicationId);
    return params.toString();
  }, [range, publicationId]);

  const loadPublications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/publications");
      const json = await res.json();
      setPublications(json.publications || []);
    } catch {
      
    }
  }, []);

  const loadTab = useCallback(
    async (tab) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/admin/analytics/${tab}?${query}`);
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        setTabData((prev) => ({ ...prev, [tab]: json }));
      } catch (err) {
        setError("Couldn't load analytics data. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  useEffect(() => {
    loadPublications();
  }, [loadPublications]);

  useEffect(() => {
    loadTab(activeTab);
   
  }, [activeTab, query]);

  return (
    <main className="min-h-screen bg-[#f7f8fa] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
      
        <div className="mb-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0b1830]">Analytics</h1>
             
            </div>
            <div className="flex flex-wrap items-center gap-2">
             
              <RangeSwitcher value={range} onChange={setRange} />
            </div>
          </div>
        </div>

       
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-[#0b1830] text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error ? (
          <EmptyState title="Something went wrong" subtitle={error} />
        ) : (
          <>
            {activeTab === "overview" && <OverviewTab data={tabData.overview} loading={loading} />}
            {activeTab === "engagement" && <EngagementTab data={tabData.engagement} loading={loading} />}
            {activeTab === "enquiries" && <EnquiriesTab data={tabData.enquiries} loading={loading} />}
            {activeTab === "campaigns" && <CampaignsTab data={tabData.campaigns} loading={loading} />}
          </>
        )}
      </div>
    </main>
  );
}