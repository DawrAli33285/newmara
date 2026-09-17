export default function LinkDisabledPage({ searchParams }) {
    const label = searchParams?.label || "This link";
  
    return (
      <main className="min-h-screen bg-[#f7f8fa] grid place-items-center p-6">
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-gray-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6 text-gray-400"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M4.93 4.93l14.14 14.14" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-[#0b1830]">Link unavailable</h1>
          <p className="mt-2 text-sm text-gray-500">
            <span className="font-semibold text-[#0b1830]">{label}</span> is
            currently disabled and cannot be accessed.
          </p>
          <a
            href="/"
            className="mt-6 inline-block rounded-xl bg-[#668b2f] px-5 py-2 text-sm font-bold text-white hover:bg-[#527323]"
          >
            Go to homepage
          </a>
        </div>
      </main>
    );
  }