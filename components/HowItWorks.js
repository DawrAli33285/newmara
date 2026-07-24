const steps = [
  {
    number: "1",
    label: "Choose",
    desc: "Browse our publications and find the one for you.",
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    number: "2",
    label: "Subscribe",
    desc: "Secure checkout and instant access.",
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
  },
  {
    number: "3",
    label: "Read",
    desc: "Enjoy on any device, anytime, anywhere.",
    icon: (
      <svg
        className="w-10 h-10"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
];

function ArrowRight({ className = "" }) {
  return (
    <svg
      className={`flex-shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function HowItWorks({
  heading = "Start Reading in 3 Simple Steps",
  bgClassName = "bg-white",
}) {
  return (
    <section className={`${bgClassName}`}>
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h2 className="text-[26px] md:text-[32px] lg:text-[36px] font-bold tracking-tight text-[#0B1830] mb-3">
              {heading}
          </h2>
          <div className="w-10 h-1 rounded-full mx-auto bg-[#2F7D1B]" />
        </div>
        <div className="hidden md:flex items-start justify-center">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-start">
              <div className="flex flex-col items-center text-center w-44">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-[#EFF5EE] flex items-center justify-center text-[#2F7D1B]">
                    {step.icon}
                  </div>
                  <div className="absolute -top-1.5 -left-1.5 w-7 h-7 rounded-full bg-[#2F7D1B] flex items-center justify-center text-white text-[13px] font-bold shadow">
                    {step.number}
                  </div>
                </div>
                <p className="text-[16px] font-bold text-[#0B1830] mb-1.5">
                  {step.label}
                </p>
                <p className="text-[14px] text-[#657084] leading-relaxed">
                  {step.desc}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-shrink-0 mt-10 mx-2 text-[#657084]">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-8 md:hidden">
          {steps.map((step, i) => (
            <div key={step.label}>
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-[#EFF5EE] flex items-center justify-center text-[#2F7D1B]">
                    {step.icon}
                  </div>
                  <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-[#2F7D1B] flex items-center justify-center text-white text-[11px] font-bold">
                    {step.number}
                  </div>
                </div>
                <div className="pt-2">
                  <p className="text-[16px] font-bold text-[#0B1830] mb-1">
                    {step.label}
                  </p>
                  <p className="text-[14px] text-[#657084] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="ml-8 mt-3 text-[#D9E0E7]">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
