export const metadata = {
    title: 'About | Mara Media Publications',
    description: 'Mara Media publishes five trusted Irish titles in print and interactive digital form.',
  }
  
  const PUBLICATIONS = [
    { title: 'The Skipper', frequency: 'Monthly', descriptor: "Ireland's leading maritime publication" },
    { title: 'Take Off', frequency: 'Annual', descriptor: 'The official magazine of Donegal Airport' },
    { title: 'Go West', frequency: 'Annual', descriptor: 'The people, businesses and experiences of the West of Ireland' },
    { title: 'Due South', frequency: 'Annual', descriptor: "Ireland's South and the people who make it special" },
    { title: 'The Business', frequency: 'Annual', descriptor: 'Business, enterprise and leadership in Donegal and the North West' },
  ]
  
  export default function AboutPage() {
    return (
      <div className="min-h-screen bg-[#F7F8FA]">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
  
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold text-[#2F7D1B] uppercase tracking-widest mb-3">About Mara Media</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0B1830] mb-4">
              Ireland's stories, published with care since 1996.
            </h1>
            <p className="text-base text-[#657084] leading-relaxed">
              Mara Media is an independent Irish publisher behind five trusted regional and
              specialist titles. For over 25 years we've covered the people, industries and
              places that make Ireland worth reading about — in print, and now as an
              interactive digital reading experience.
            </p>
          </div>
  
          <div className="mb-8">
            <h2 className="text-xs font-bold text-[#657084] uppercase tracking-widest mb-4">Our Publications</h2>
            <div className="bg-white border border-[#D9E0E7] rounded-2xl divide-y divide-[#D9E0E7]">
              {PUBLICATIONS.map((pub) => (
                <div key={pub.title} className="px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-[#0B1830] font-semibold">{pub.title}</p>
                    <p className="text-sm text-[#657084] mt-0.5">{pub.descriptor}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#EFF5EE] text-[#2F7D1B] shrink-0">
                    {pub.frequency}
                  </span>
                </div>
              ))}
            </div>
          </div>
  
          <div className="mb-8">
            <h2 className="text-xs font-bold text-[#657084] uppercase tracking-widest mb-4">How We Publish</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-[#D9E0E7] rounded-2xl p-6">
                <div className="w-10 h-10 rounded-full bg-[#EFF5EE] flex items-center justify-center mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F7D1B" strokeWidth="2">
                    <rect x="4" y="2" width="16" height="20" rx="2" />
                    <path d="M8 6h8M8 10h8M8 14h5" />
                  </svg>
                </div>
                <p className="text-[#0B1830] font-semibold mb-1">In Print</p>
                <p className="text-sm text-[#657084]">
                  Every title is printed to the same editorial standard our readers and
                  advertisers have trusted for decades.
                </p>
              </div>
              <div className="bg-white border border-[#D9E0E7] rounded-2xl p-6">
                <div className="w-10 h-10 rounded-full bg-[#EFF5EE] flex items-center justify-center mb-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2F7D1B" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 18v3" />
                  </svg>
                </div>
                <p className="text-[#0B1830] font-semibold mb-1">Interactive Digital</p>
                <p className="text-sm text-[#657084]">
                  Every issue is also available as an interactive flipbook reader — searchable,
                  bookmarkable and built for desktop, tablet and mobile.
                </p>
              </div>
            </div>
          </div>
  
          <div className="bg-white border border-[#D9E0E7] rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[#0B1830] font-semibold text-sm">Looking for Mara Media as a company?</p>
              <p className="text-[#657084] text-xs mt-0.5">Visit the main Mara Media website for corporate information</p>
            </div>
            <a
              href="https://www.maramedia.ie"
              className="shrink-0 bg-[#EFF5EE] hover:bg-[#e3ede1] text-[#2F7D1B] text-sm font-semibold px-5 py-2.5 rounded-xl transition"
            >
              Visit Mara Media →
            </a>
          </div>
  
        </div>
      </div>
    )
  }