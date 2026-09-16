"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/saved-outfits", label: "Saved Outfits", icon: "saved" },
  { href: "/home", label: "Home", icon: "home" },
  { href: "/account", label: "Account", icon: "account" },
] as const;

type NavIcon = (typeof NAV_ITEMS)[number]["icon"];

function NavigationIcon({ icon }: { icon: NavIcon }) {
  if (icon === "saved") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M6 4.75h12v15l-6-3.5-6 3.5v-15Z" />
      </svg>
    );
  }

  if (icon === "home") {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="m4 10 8-6 8 6v9.25H14.5v-5h-5v5H4V10Z" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6" />
    </svg>
  );
}

export function ApplicationNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Application navigation"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur"
    >
      <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium",
                "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1",
                active
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
              ].join(" ")}
            >
              <NavigationIcon icon={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}