import Link from "next/link";
import logo from "../../public/logo-mara-media-white.png";
import Image from "next/image";
export default function BusinessAuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f5f7f4] px-4 py-6 text-[#0b1830] sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center gap-3 pb-8">
        <Link
          href="/business"
          className="rounded-lg bg-[#0b1830] px-3 py-2 font-serif text-xl font-bold text-white"
        >
          <Image
            src={logo}
            alt="Mara Media"
            width={100}
            height={100}
            className="rounded-md"
            priority
          />
        </Link>

        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Business portal
        </span>
      </div>

      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(11,24,48,0.12)] lg:grid-cols-2">
        <aside className="flex min-h-[300px] flex-col justify-between bg-[#0b1830] p-8 text-white sm:p-12 lg:min-h-[650px]">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#b9e757]">
              Grow your presence
            </p>

            <h1 className="mt-4 max-w-md font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
              Put your business in front of curious readers.
            </h1>

            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
              Manage your profile, share exclusive offers, and connect with
              people discovering Ireland through Mara Media.
            </p>
          </div>

          <div className="mt-10 hidden border-t border-white/15 pt-5 sm:flex sm:items-start sm:gap-3">
            <span className="text-xl text-[#b9e757]">✦</span>
            <p className="max-w-xs text-xs leading-6 text-slate-400">
              Built for independent businesses, local favourites, and the
              stories behind them.
            </p>
          </div>
        </aside>

        <main className="flex items-center p-6 sm:p-12">{children}</main>
      </div>
    </div>
  );
}
