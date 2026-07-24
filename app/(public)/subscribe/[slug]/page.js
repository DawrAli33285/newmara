import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PublicationCoverPanel from "@/components/PublicationCoverPanel";
import SubscriptionCard from "@/components/SubscriptionCard";
import DigitalUpdatesPanel from "@/components/DigitalUpdatesPanel";

const styleMap = {
  "the-skipper": {
    color: "from-blue-900 to-blue-700",
    emoji: "⚓",
    price: "€99/year",
    tagline: "Monthly maritime publication",
    lead: "The voice of Ireland's fishing industry for over 60 years. Bringing you the latest news, vessel features, fishing technology, regulations, ports, seafood, events and industry developments from Ireland and beyond.",
    benefits: [
      { text: "Every monthly issue of The Skipper" },
      { text: "Full archive of past editions" },
      { text: "Interactive flipbook reader" },
      { text: "Read on any device" },
      { text: "Monthly digital industry updates", new: true },
      {
        text: "Featured suppliers, promotions and product launches",
        new: true,
      },
      {
        text: "Interactive adverts linking directly to businesses and services",
      },
    ],
    updatesPanel: {
      heading: "Monthly digital updates",
      intro: "Each month you'll get:",
      items: [
        { label: "Latest industry news & insights", icon: <NewsIcon /> },
        { label: "Exclusive offers & promotions", icon: <TagIcon /> },
        { label: "Fleet updates & regulatory changes", icon: <BoatIcon /> },
        { label: "Market data & analysis", icon: <ChartIcon /> },
        { label: "Events & training opportunities", icon: <PeopleIcon /> },
      ],
    },
  },
  "take-off": {
    color: "from-sky-800 to-sky-600",
    emoji: "✈️",
    price: "€50/year",
    tagline: "Annual aviation publication",
    lead: "The official magazine of Donegal Airport.",
    benefits: [
      { text: "Every issue" },
      { text: "Full archive of past editions" },
      { text: "Interactive flipbook reader" },
      { text: "Read on any device" },
      { text: "New businesses and services", new: true },
      { text: "Offers and promotions", new: true },
      { text: "Local news, places to visit and community highlights" },
    ],
    updatesPanel: {
      heading: "Monthly digital updates",
      intro: "Each month you'll get:",
      items: [
        { label: "New businesses & services", icon: <NewsIcon /> },
        { label: "Offers & promotions", icon: <TagIcon /> },
        { label: "Local news", icon: <BoatIcon /> },
        { label: "Places to visit", icon: <ChartIcon /> },
        { label: "Community highlights", icon: <PeopleIcon /> },
      ],
    },
  },
  "go-west": {
    color: "from-emerald-800 to-emerald-600",
    emoji: "🌿",
    price: "€50/year",
    tagline: "Annual travel and tourism publication",
    lead: "Celebrating the people, businesses and experiences of the West of Ireland.",
    benefits: [
      { text: "Every issue" },
      { text: "Full archive of past editions" },
      { text: "Interactive flipbook reader" },
      { text: "Read on any device" },
      { text: "Monthly digital updates for the West of Ireland", new: true },
    ],
    updatesPanel: {
      heading: "Monthly digital updates",
      intro: "Each month you'll get:",
      items: [
        { label: "New businesses & services", icon: <NewsIcon /> },
        { label: "Offers & promotions", icon: <TagIcon /> },
        { label: "Local news", icon: <BoatIcon /> },
        { label: "Places to visit", icon: <ChartIcon /> },
        { label: "Community highlights", icon: <PeopleIcon /> },
      ],
    },
  },
  "due-south": {
    color: "from-amber-800 to-amber-600",
    emoji: "🧭",
    price: "€50/year",
    tagline: "Annual travel and lifestyle publication",
    lead: "Celebrating Ireland's South and the people who make it special.",
    benefits: [
      { text: "Every issue" },
      { text: "Full archive of past editions" },
      { text: "Interactive flipbook reader" },
      { text: "Read on any device" },
      { text: "Monthly digital updates for Ireland's South", new: true },
    ],
    updatesPanel: {
      heading: "Monthly digital updates",
      intro: "Each month you'll get:",
      items: [
        { label: "New businesses & services", icon: <NewsIcon /> },
        { label: "Offers & promotions", icon: <TagIcon /> },
        { label: "Local news", icon: <BoatIcon /> },
        { label: "Places to visit", icon: <ChartIcon /> },
        { label: "Community highlights", icon: <PeopleIcon /> },
      ],
    },
  },
  "the-business": {
    color: "from-slate-800 to-slate-600",
    emoji: "📈",
    price: "€50/year",
    tagline: "Annual business publication",
    lead: "Business, enterprise and leadership in Donegal and the North West.",
    benefits: [
      { text: "Every issue" },
      { text: "Full archive of past editions" },
      { text: "Interactive flipbook reader" },
      { text: "Read on any device" },
      { text: "Business news and industry insights", new: true },
      { text: "Interviews and economic developments", new: true },
      { text: "Events and opportunities" },
    ],
    updatesPanel: {
      heading: "Monthly digital updates",
      intro: "Each month you'll get:",
      items: [
        { label: "Business news", icon: <NewsIcon /> },
        { label: "Industry insights", icon: <TagIcon /> },
        { label: "Interviews", icon: <BoatIcon /> },
        { label: "Economic developments", icon: <ChartIcon /> },
        { label: "Events & opportunities", icon: <PeopleIcon /> },
      ],
    },
  },
};

const fallbackStyle = {
  color: "from-blue-900 to-blue-700",
  emoji: "📖",
  price: "€29/year",
  tagline: "Digital publication",
  lead: "",
  benefits: [
    { text: "Access to all published issues" },
    { text: "Full archive of back issues" },
    { text: "Interactive flipbook reader" },
    { text: "Read on any device" },
  ],
  updatesPanel: null,
};

export default async function SubscribePage({ params }) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const publication = await prisma.publication.findUnique({ where: { slug } });
  if (!publication) redirect("/");

  let alreadySubscribed = false;
  if (session) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (user) {
      const existing = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          publicationId: publication.id,
          status: "active",
        },
      });
      alreadySubscribed = !!existing;
    }
  }

  const style = styleMap[slug] || fallbackStyle;

  return (
    <div style={{ backgroundColor: "#FFFFFF" }} className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <a
          href="/browse"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold transition hover:opacity-80"
          style={{ color: "#2F7D1B" }}
        >
          <ArrowLeftIcon />
          Back to publications
        </a>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <PublicationCoverPanel publication={publication} style={style} />

          <div>
            <h1
              className="text-3xl font-bold leading-tight sm:text-4xl lg:text-[42px]"
              style={{ color: "#0B1830" }}
            >
              {publication.title}
            </h1>
            <p
              className="mb-4 mt-2 text-base font-semibold sm:text-lg"
              style={{ color: "#2F7D1B" }}
            >
              {style.tagline}
            </p>
            {(publication.description || style.lead) && (
              <p
                className="mb-7 text-base leading-relaxed sm:text-lg"
                style={{ color: "#0B1830" }}
              >
                {publication.description || style.lead}
              </p>
            )}

            <SubscriptionCard
              slug={slug}
              publication={publication}
              style={style}
              alreadySubscribed={alreadySubscribed}
              loggedIn={!!session}
            />
          </div>
        </div>

        <DigitalUpdatesPanel style={style} />

        <div
          className="mt-10 grid grid-cols-1 gap-6 rounded-2xl border p-6 sm:grid-cols-3 sm:p-8"
          style={{ borderColor: "#D9E0E7" }}
        >
          <ReassuranceItem
            icon={<DeviceIcon />}
            title="Read anywhere, any time"
            body="Enjoy on desktop, tablet or mobile."
          />
          <ReassuranceItem
            icon={<ShieldIcon />}
            title="Secure & private"
            body="Your account and payments are 100% secure."
          />
          <ReassuranceItem
            icon={<CycleIcon />}
            title="Cancel anytime"
            body="No long-term commitment. Cancel anytime."
          />
        </div>
      </div>
    </div>
  );
}

function ReassuranceItem({ icon, title, body }) {
  return (
    <div className="flex flex-col items-center text-center sm:items-center sm:textcenter">
      <div
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-full"
        style={{ backgroundColor: "#EFF5EE" }}
      >
        <span style={{ color: "#2F7D1B" }}>{icon}</span>
      </div>
      <p className="mb-1 text-sm font-semibold" style={{ color: "#0B1830" }}>
        {title}
      </p>
      <p className="text-sm" style={{ color: "#657084" }}>
        {body}
      </p>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M19 12H5M5 12l7-7M5 12l7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NewsIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="14"
        height="16"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M7 8h6M7 11h6M7 14h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11.5 3H5a2 2 0 0 0-2 2v6.5a2 2 0 0 0 .59 1.41l8.5 8.5a2 2 0 0 0 2.82 0l6.5-6.5a2 2 0 0 0 0-2.82l-8.5-8.5A2 2 0 0 0 11.5 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function BoatIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 15h18l-2 5H5l-2-5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M6 15V6h9l3 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 2v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="14"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M6 14l3-3 2.5 2 4.5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M15.5 14.2c2.6.3 4.5 2.4 4.5 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="6"
        width="14"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect
        x="17"
        y="9"
        width="5"
        height="10"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CycleIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17 4v3.5H13.5M7 20v-3.5h3.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
