import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const pubMeta = {
  "the-skipper": {
    frequency: "Monthly",
    titleLine1: "— The —",
    titleLine2: "Skipper",
    year: "May 2024",
  },
  "take-off": {
    frequency: "Annual",
    titleLine1: null,
    titleLine2: "Take Off",
    year: "2024",
  },
  "go-west": {
    frequency: "Annual",
    titleLine1: null,
    titleLine2: "Go West",
    year: "2024",
  },
  "due-south": {
    frequency: "Annual",
    titleLine1: null,
    titleLine2: "Due South",
    year: "2024",
  },
  "the-business": {
    frequency: "Annual",
    titleLine1: "The",
    titleLine2: "Business",
    year: "2024",
  },
};

const publicationOrder = [
  "the-skipper",
  "take-off",
  "go-west",
  "due-south",
  "the-business",
];

function ArrowRight() {
  return (
    <svg
      className="w-4 h-4 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default async function PublicationsGrid({
  heading = "Browse Our Publications",
  subheading = null,
  bgClassName = "bg-white",
}) {
  const session = await getServerSession(authOptions);

  const publications = await prisma.publication.findMany({
    where: { isPublished: true },
  });

  publications.sort((a, b) => {
    const indexA = publicationOrder.indexOf(a.slug);
    const indexB = publicationOrder.indexOf(b.slug);
    const safeA = indexA === -1 ? publicationOrder.length : indexA;
    const safeB = indexB === -1 ? publicationOrder.length : indexB;
    return safeA - safeB;
  });

  let subscribedIds = new Set();
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (user) {
      const subs = await prisma.subscription.findMany({
        where: { userId: user.id, status: "active" },
        select: { publicationId: true },
      });
      subscribedIds = new Set(subs.map((s) => s.publicationId));
    }
  }

  return (
    <section className={bgClassName}>
      <div className="max-w-360 mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-[26px] md:text-[32px] lg:text-[36px] font-bold tracking-tight text-[#0B1830] mb-3">
            {heading}
          </h2>
          {subheading && (
            <p className="text-[15px] md:text-[16px] text-[#657084] max-w-xl mx-auto mb-3">
              {subheading}
            </p>
          )}
          <div className="w-10 h-1 rounded-full mx-auto bg-[#2F7D1B]" />
        </div>

        {publications.length === 0 ? (
          <p className="text-center text-[16px] text-[#657084]">
            No publications available yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {publications.map((pub) => {
              const meta = pubMeta[pub.slug] ?? {
                frequency: "Annual",
                titleLine1: null,
                titleLine2: pub.title,
                year: "2024",
              };
              const isSubscribed = subscribedIds.has(pub.id);

              return (
                <div
                  key={pub.slug}
                  className="group flex flex-col rounded-2xl overflow-hidden border border-[#D9E0E7] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative overflow-hidden flex-shrink-0 aspect-[3/4] bg-[#0B2A4A]">
                    {pub.coverImageUrl && (
                      <img
                        src={pub.coverImageUrl}
                        alt={`${pub.title} cover`}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    )}

             

                    {isSubscribed && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide bg-[#2F7D1B] text-white px-2 py-1 rounded-full">
                        Subscribed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 p-4">
                    <p className="text-[16px] font-bold text-[#0B1830] leading-snug mb-1">
                      {pub.title}
                    </p>

                    <p className="text-[14px] font-semibold text-[#2F7D1B] mb-3">
                      {meta.frequency}
                    </p>

                    {pub.description && (
                      <p className="text-[14px] text-[#657084] leading-relaxed flex-1 mb-4">
                        {pub.description}
                      </p>
                    )}

                    {isSubscribed ? (
                      <Link
                        href={`/read/${pub.slug}`}
                        className="
                          flex items-center justify-center gap-[20px] w-full
                          min-h-[44px] px-4 py-2.5 rounded-lg
                          text-[15px] font-medium
                          bg-[#2F7D1B] text-white
                          hover:bg-[#256315]
                          transition-all duration-200
                        "
                      >
                        Read Now
                        <ArrowRight />
                      </Link>
                    ) : (
                      <Link
                        href={`/read/${pub.slug}`}
                        className="
                          flex items-center justify-center gap-[20px] w-full
                          min-h-[44px] px-4 py-2.5 rounded-lg
                          text-[15px] font-medium
                          border border-[#2F7D1B] text-[#2F7D1B]
                          hover:bg-[#2F7D1B] hover:text-white
                          transition-all duration-200
                        "
                      >
                        View Publication
                        <ArrowRight />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
