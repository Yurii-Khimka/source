"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Bookmark, User } from "lucide-react";
import { dark } from "@/lib/tokens";

const tabs = [
  { icon: Home, label: "Home", href: "/", match: (p: string) => p === "/" },
  { icon: Compass, label: "Discovery", href: "/discovery", match: (p: string) => p.startsWith("/discovery") },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks", match: (p: string) => p.startsWith("/bookmarks") },
  { icon: User, label: "Profile", href: "/profile/mobile", match: (p: string) => p.startsWith("/profile/mobile") },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="bottom-tab-bar"
      style={{
        display: "none",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: dark.surface,
        borderTop: `1px solid ${dark.line}`,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-label={tab.label}
            aria-current={active ? "page" : undefined}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 64,
              color: active ? dark.accentText : dark.textMute,
              textDecoration: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <tab.icon size={22} aria-hidden="true" />
          </Link>
        );
      })}
    </nav>
  );
}
