const items = [
  {
    stat: '5 Premium Publications',
    desc: 'Maritime, aviation, tourism, business & regional titles.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    stat: 'Established Since 1996',
    desc: 'Nearly three decades of trusted Irish publishing.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    stat: 'Interactive Reading',
    desc: 'Search, zoom, bookmark and read on any device.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    stat: 'Read Anywhere',
    desc: 'Desktop, tablet or mobile. Access whenever you want.',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export default function TrustStrip() {
  return (
    <section className="bg-white px-4 md:px-8 -mt-8 relative z-20">
      <div className="max-w-360 mx-auto bg-white rounded-2xl border border-[#D9E0E7] shadow-lg px-6 md:px-10 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {items.map((item, i) => (
            <div
              key={item.stat}
              className={`
                flex flex-col items-center text-center gap-3
                ${i < items.length - 1 ? 'lg:border-r lg:border-[#D9E0E7]' : ''}
              `}
            >
              <div className="text-[#2F7D1B]">{item.icon}</div>
              <div>
                <p className="text-[17px] font-extrabold text-[#0B1830] leading-snug">{item.stat}</p>
                <p className="text-[14px] text-[#657084] mt-1 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}