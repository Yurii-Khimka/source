"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Users, Hash, Bookmark } from "lucide-react";

const inter = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Discovery", icon: Compass, href: "/discovery" },
  { label: "Following", icon: Users, href: "/following" },
  { label: "Tags", icon: Hash, href: "/tags" },
  { label: "Bookmarks", icon: Bookmark, href: "/bookmarks" },
] as const;

interface SidebarNavProps {
  bookmarkCount: number;
  followedSources: { id: string; name: string; handle: string }[];
}

export function SidebarNav({ bookmarkCount: initialBookmarkCount, followedSources: initialFollowedSources }: SidebarNavProps) {
  const pathname = usePathname();
  const [bookmarkCount, setBookmarkCount] = useState(initialBookmarkCount);
  const [followedSources, setFollowedSources] = useState(initialFollowedSources);

  useEffect(() => {
    async function refreshBookmarks() {
      const res = await fetch("/api/bookmark-count");
      if (res.ok) {
        const data = await res.json();
        setBookmarkCount(data.count);
      }
    }
    window.addEventListener("bookmarkChanged", refreshBookmarks);
    return () => window.removeEventListener("bookmarkChanged", refreshBookmarks);
  }, []);

  useEffect(() => {
    async function refreshFollows() {
      const res = await fetch("/api/followed-sources");
      if (res.ok) {
        const data = await res.json();
        setFollowedSources(data.sources);
      }
    }
    window.addEventListener("followChanged", refreshFollows);
    return () => window.removeEventListener("followChanged", refreshFollows);
  }, []);

  return (
    <>
      {/* Navigation */}
      <nav className="space-y-0.5">
        {navItems.map((item) => {
          const active = item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className="sidebar-nav-item flex items-center gap-2.5"
              style={{
                height: 36,
                padding: "8px 10px",
                borderRadius: 6,
                fontFamily: inter,
                fontSize: 13.5,
                color: active ? "#EEF1F6" : "#C7CCD6",
                background: active ? "#161B26" : undefined,
                textDecoration: "none",
                transition: "background 0.12s",
              }}
            >
              <Icon
                size={16}
                style={{ color: active ? "#EEF1F6" : "#A3ACBD", flexShrink: 0 }}
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.label === "Bookmarks" && bookmarkCount > 0 && (
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    color: "#6C727E",
                    background: "#161B26",
                    border: "1px solid rgba(255,255,255,0.10)",
                    borderRadius: 3,
                    padding: "1px 5px",
                    lineHeight: 1.4,
                  }}
                >
                  {bookmarkCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Followed Sources */}
      {followedSources.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: "#6C727E",
              padding: "6px 10px",
            }}
          >
            Followed sources
          </div>
          <div className="space-y-0.5">
            {followedSources.map((source) => {
              const href = `/source/${source.handle}`;
              const active = pathname === href;

              return (
                <Link
                  key={source.id}
                  href={href}
                  className="sidebar-nav-item flex items-center gap-2.5 truncate"
                  style={{
                    height: 36,
                    padding: "8px 10px",
                    borderRadius: 6,
                    fontFamily: inter,
                    fontSize: 13.5,
                    color: active ? "#EEF1F6" : "#C7CCD6",
                    background: active ? "#161B26" : undefined,
                    textDecoration: "none",
                    transition: "background 0.12s",
                  }}
                >
                  <span style={{ color: "#A3ACBD", flexShrink: 0 }}>#</span>
                  <span className="truncate">{source.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
