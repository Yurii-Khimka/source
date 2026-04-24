"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Bookmark, User } from "lucide-react";
import { dark } from "@/lib/tokens";

const tabs = [
  { icon: Home, href: "/", match: (p: string) => p === "/" },
  { icon: Compass, href: "/discovery", match: (p: string) => p.startsWith("/discovery") },
  { icon: Bookmark, href: "/bookmarks", match: (p: string) => p.startsWith("/bookmarks") },
  { icon: User, href: "/profile/mobile", match: (p: string) => p.startsWith("/profile/mobile") },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="bottom-tab-bar"
      style={{
        display: "none",
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: 64,
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
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 64,
              color: active ? dark.accent : dark.textMute,
              textDecoration: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <tab.icon size={22} />
          </Link>
        );
      })}
    </nav>
  );
}
