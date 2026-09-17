"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from '@/public/logo.png'
import Image from 'next/image'

const NAV_BY_PLAN = {
  digital_partner: [
    { label: "Overview", href: "/business/dashboard", icon: "▦" },
    { label: "Business profile", href: "/business/businessprofile", icon: "♙" },
    { label: "Offers", href: "/business/offers", icon: "✦" },
  ],
  digital_partner_advertiser: [
    { label: "Overview", href: "/business/dashboard", icon: "▦" },
    { label: "Ad Page", href: "/business/adpage", icon: "▤" },
    { label: "Business profile", href: "/business/businessprofile", icon: "♙" },
    { label: "Offers", href: "/business/offers", icon: "✦" },
  ],
  advertiser: [
    { label: "Overview", href: "/business/advertiserdashboard", icon: "▦" },
    { label: "Ad Page", href: "/business/adpage", icon: "▤" },
  ],
  directory_listing: [
    { label: "Overview", href: "/business/listingdashboard", icon: "▦" },
   
  ],
};

const DEFAULT_NAV = NAV_BY_PLAN.digital_partner;

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function SidebarContent({ navigation, pathname, onNavigate }) {
  return (
    <>
      <div className="border-b border-blue-800 px-6 py-6">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold">
        <Image src={logo} alt="Mara Media" style={{width:'7rem',height:'3rem'}} className="rounded" />

        </Link>
        <p className="mt-1 text-xs text-blue-200">Business Portal</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition ${
                isActive ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-900"
              }`}
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-blue-800 p-4">
        <p className="truncate text-xs text-blue-200">business@example.com</p>
        <Link href="/business/login" className="mt-3 block text-xs text-red-200 hover:text-white">
          Sign out
        </Link>
      </div>
    </>
  );
}

export default function BusinessDashboardLayout({ children }) {
  const pathname = usePathname();
  const [navigation, setNavigation] = useState(DEFAULT_NAV);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      try {
        const res = await fetch("/api/business/plan-status");
        const data = await res.json();
        setNavigation(NAV_BY_PLAN[data.planType] || DEFAULT_NAV);
      } catch {
        setNavigation(DEFAULT_NAV);
      }
    }
    loadPlan();
  }, []);

  return (
    <div className="min-h-screen bg-[#f6f8fa] text-[#0b1830]">
    
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#1c3664] text-white md:flex">
        <SidebarContent navigation={navigation} pathname={pathname} />
      </aside>

     
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-[#1c3664] text-white">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg text-blue-200 hover:bg-blue-900 hover:text-white"
            >
              <CloseIcon />
            </button>
            <SidebarContent
              navigation={navigation}
              pathname={pathname}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="min-h-screen md:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
              >
                <MenuIcon />
              </button>
              <Link href="/business/dashboard" className="flex items-center gap-2 font-bold">
              <Image src={logo} alt="Mara Media" style={{width:'3rem',height:'2rem'}} className="rounded" />


              </Link>
            </div>
            <div className="hidden items-center gap-6 md:flex">
              <Link
                href="/business/dashboard"
                className="text-xs font-semibold text-slate-500 hover:text-[#2f7d1b]"
              >
                Business portal
              </Link>
              <Link
                href="/business"
                className="text-xs font-semibold text-slate-500 hover:text-[#2f7d1b]"
              >
                View public page →
              </Link>
            </div>

            <Link
              href="/business"
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 md:hidden"
            >
              Public page
            </Link>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}