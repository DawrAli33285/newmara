import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f1f3d] via-[#1a3460] to-[#0d3b72]">

      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300 rounded-full opacity-10 blur-3xl" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-8">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          Ireland's Digital Magazine Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
          Read the magazines
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
            you love, anywhere.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto mb-10 leading-relaxed">
          One subscription unlocks your favourite Irish publication — maritime, aviation, business and regional.
          Beautiful flipbook reading on any device.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/subscribe"
            className="px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-full text-base transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-400/40 hover:-translate-y-0.5"
          >
            Start Reading Today
          </Link>
          <Link
            href="/#publications"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-full text-base transition-all duration-200 backdrop-blur-sm"
          >
            Browse Publications
          </Link>
        </div>

        <p className="mt-8 text-sm text-blue-300 opacity-70">
          Cancel anytime · Instant access · All back issues included
        </p>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 text-xs">
        <span>Scroll to explore</span>
        <div className="w-px h-8 bg-white/20 animate-bounce" />
      </div>
    </section>
  )
}