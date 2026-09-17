"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logo from '@/public/logo.png'
import Image from 'next/image'

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/publications", label: "Publications", icon: "📖" },
  { href: "/subscribers", label: "Subscribers", icon: "👥" },
  { href: "/advertisers", label: "Advertisers", icon: "💼" },
  { href: "/print-packages", label: "Print Packages", icon: "📦" },
  { href: "/digital-packages", label: "Digital Packages", icon: "📦" },
  { href: "/profile-edits", label: "Profile Edits", icon: "✏️" },
  { href: "/campaign-links", label: "QR & Campaigns", icon: "🔗" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/promotions", label: "Offers & Promotions", icon: "🎁" },
  { href: "/digital-partners", label: "Digital Partners", icon: "🤝" },
  { href: "/directory-listing", label: "Directory Listing", icon: "📇" },
  { href: "/destinations", label: "Destinations", icon: "🗺️" },
  { href: "/enquiries", label: "Enquiries", icon: "✉️" },
  { href: "/audit-log", label: "Audit Log", icon: "📜" },
  { href: "/approval-items", label: "Approval Items", icon: "✅" },
  {href:'/categories',label:"Categories",icon:"📜"}
];
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

function NavLink({ href, icon, children, active, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
        active ? "bg-blue-800 text-white" : "text-blue-100 hover:bg-blue-800 hover:text-white"
      }`}
    >
      <span>{icon}</span>
      {children}
    </Link>
  );
}

function SidebarBody({ pathname, email, onNavigate }) {
  return (
    <>
      <div className="border-b border-blue-800 p-6">
        <div className="flex items-center gap-2.5">
          <Image src={logo} alt="Mara Media" style={{width:'7rem',height:'3rem'}} className="rounded" />

        </div>
        <p className="mt-1 text-xs text-blue-300">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            active={pathname === item.href || pathname.startsWith(item.href + "/")}
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-blue-800 p-4">
        <p className="truncate text-xs text-blue-300">{email}</p>
        <Link href="/api/auth/signout" className="mt-1 block text-xs text-red-300 hover:text-red-100">
          Sign out
        </Link>
      </div>
    </>
  );
}

export default function AdminSidebar({ email }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
   
      <aside className="hidden min-h-screen w-64 flex-col bg-[#1C3664] md:flex">
        <SidebarBody pathname={pathname} email={email} />
      </aside>

    
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-[#1C3664] px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
        <Image src={logo} alt="Mara Media" style={{width:'3rem',height:'2rem'}} className="rounded" />


        </div>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="grid h-9 w-9 place-items-center rounded-lg text-blue-100 hover:bg-blue-800"
        >
          <MenuIcon />
        </button>
      </div>
     
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-[#1C3664]">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white"
            >
              <CloseIcon />
            </button>
            <SidebarBody pathname={pathname} email={email} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}