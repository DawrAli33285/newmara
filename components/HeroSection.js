import Link from "next/link";
import Image from "next/image";
import logo from "../public/tablet.png";
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

export default function HeroSection() {
  return (
    <section
      className="
        w-full relative overflow-hidden
        bg-[url('../public/banner.png')] bg-cover bg-center
        min-h-[480px] lg:min-h-[540px]
      "
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/55 to-transparent" />

      <div className="relative z-10 max-w-360 mx-auto px-6 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px] lg:min-h-[540px] items-center gap-8">
          <div className="flex flex-col justify-center py-14 lg:py-20 max-w-lg">
            <h1 className="text-[34px] md:text-[46px] lg:text-[54px] font-bold leading-tight tracking-tight text-[#081B31] mb-5">
              Ireland's Trusted
              <br />
              Digital Publications.
            </h1>

            <p className="text-[17px] leading-relaxed text-[#3a4a5c] max-w-sm mb-8">
              Discover Ireland through our premium collection of maritime,
              aviation, business and regional publications in one interactive
              reading experience.
            </p>

            <div>
              <Link
                href="/browse"
                className="inline-flex items-center gap-2.5 px-7 py-3 rounded-lg text-[16px] font-semibold text-white bg-[#2F7D1B] min-h-[44px] hover:bg-[#266615] hover:-translate-y-0.5 transition-all duration-200 shadow-md"
              >
                Browse Publications
                <ArrowRight />
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-end  w-full  justify-center py-8">
            <Image
              src={logo}
              alt="Mara Media"
              width={1000}
              height={1000}
              className="w-[400px] max-w-[400px] h-auto object-contain drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
