import SubscribeButton from "@/app/(public)/subscribe/[slug]/SubscribeButton";

export default function SubscriptionCard({
  slug,
  publication,
  style,
  alreadySubscribed,
  loggedIn,
}) {
  return (
    <div
      className="rounded-2xl border bg-white p-6 sm:p-8"
      style={{ borderColor: "#D9E0E7" }}
    >
      <div className="flex items-center justify-between gap-4 pb-5">
        <span className="text-base font-semibold" style={{ color: "#0B1830" }}>
          Annual subscription
        </span>
        <div className="text-right">
          <span className="text-3xl font-bold" style={{ color: "#2F7D1B" }}>
            {style.price}
          </span>
        </div>
      </div>

      <div className="h-px w-full" style={{ backgroundColor: "#D9E0E7" }} />

      <ul className="space-y-3 py-5">
        {style.benefits.map((benefit, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckIcon />
            <span className="text-sm leading-snug" style={{ color: "#0B1830" }}>
              {benefit.new && (
                <span
                  className="mr-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white align-middle"
                  style={{ backgroundColor: "#2F7D1B" }}
                >
                  New
                </span>
              )}
              {benefit.text}
            </span>
          </li>
        ))}
      </ul>

      {alreadySubscribed ? (
        <div className="space-y-3">
          <div
            className="rounded-xl p-4 text-center text-sm font-medium"
            style={{ backgroundColor: "#EFF5EE", color: "#2F7D1B" }}
          >
            ✓ You are already subscribed
          </div>
          <a
            href={`/read/${slug}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: "#2F7D1B", minHeight: 44 }}
          >
            Read Now →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {loggedIn ? (
            <SubscribeButton publicationId={publication.id} slug={slug} />
          ) : (
            <a
              href={`/login?callbackUrl=/subscribe/${slug}`}
              className="flex w-full items-center justify-center rounded-xl py-3.5 text-base font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: "#2F7D1B", minHeight: 44 }}
            >
              Log in to Subscribe
            </a>
          )}

          <p
            className="flex items-center justify-center gap-2 text-sm"
            style={{ color: "#657084" }}
          >
            <LockIcon />
            Secure checkout
          </p>
        </div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="mt-0.5 flex-shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="#2F7D1B" strokeWidth="1.6" />
      <path
        d="M8 12.5l2.5 2.5 5.5-6"
        stroke="#2F7D1B"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}