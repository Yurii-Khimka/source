import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Newspaper, Search, Bookmark, Settings, ShieldCheck,
  Sun, Bell, User,
} from "lucide-react";
import { dark } from "@/lib/tokens";
import { HeaderBreadcrumb } from "@/components/header-breadcrumb";

export async function Shell({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const { data: sources } = await supabase
    .from("sources")
    .select("id, name, handle")
    .eq("is_hidden", false)
    .order("name");

  const { data: { user } } = await supabase.auth.getUser();

  let profile: { avatar_url: string | null; display_name: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url, display_name")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const iconBtnStyle: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: dark.textDim,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.15s",
  };

  return (
    <div className="min-h-screen" style={{ background: dark.bg, color: dark.text }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30"
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr 360px",
          alignItems: "center",
          height: 64,
          padding: "0 24px 0 20px",
          background: dark.surface,
          borderBottom: `1px solid ${dark.line}`,
        }}
      >
        {/* Left — Logo */}
        <Link href="/" className="flex items-center gap-[10px]" style={{ textDecoration: "none" }}>
          <div
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: dark.text,
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={20} color={dark.bg} />
          </div>
          <div style={{ lineHeight: 1.3 }}>
            <div
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: dark.text,
                letterSpacing: 0.8,
              }}
            >
              The Source
            </div>
            <div
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 11,
                color: dark.textDim,
              }}
            >
              Source of Truth
            </div>
          </div>
        </Link>

        {/* Center — Breadcrumbs */}
        <div className="flex items-center justify-center">
          <HeaderBreadcrumb />
        </div>

        {/* Right — Icon buttons */}
        <div className="flex items-center justify-end gap-1">
          <Link href="/search" title="Search" className="header-icon-btn" style={iconBtnStyle}>
            <Search size={18} />
          </Link>

          <button title="Toggle theme" className="header-icon-btn" style={iconBtnStyle}>
            <Sun size={18} />
          </button>

          <button title="Notifications" className="header-icon-btn" style={iconBtnStyle}>
            <Bell size={18} />
            <span
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: dark.accent,
              }}
            />
          </button>

          <Link
            href={user ? "/settings" : "/auth/signin"}
            title={user ? "Profile" : "Sign in"}
            className="header-icon-btn"
            style={iconBtnStyle}
          >
            {user && profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <User size={18} />
            )}
          </Link>

          <Link href="/settings" title="Settings" className="header-icon-btn" style={iconBtnStyle}>
            <Settings size={18} />
          </Link>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className="fixed top-[64px] left-0 bottom-0 flex flex-col justify-between overflow-y-auto"
        style={{
          width: 220,
          borderRight: `1px solid ${dark.line}`,
          background: dark.bgAlt,
        }}
      >
        <nav className="px-3 py-4 space-y-0.5">
          {[
            { label: "Feed", icon: <Newspaper size={15} />, href: "/", active: true },
            { label: "Search", icon: <Search size={15} />, href: "/search", active: false },
            { label: "Bookmarks", icon: <Bookmark size={15} />, href: "/bookmarks", active: false },
            { label: "Settings", icon: <Settings size={15} />, href: "/settings", active: false },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 px-2 py-1.5 rounded transition-colors"
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                color: item.active ? "#fff" : dark.textDim,
                background: item.active ? dark.hover : undefined,
              }}
            >
              <span
                className="w-5 flex justify-center"
                style={{ color: item.active ? "#fff" : dark.textMute }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <div
            className="uppercase tracking-wider mb-2 px-2"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: dark.textMute,
            }}
          >
            Sources
          </div>
          <ul className="space-y-0.5">
            {sources?.map((source) => (
              <li key={source.id}>
                <a
                  href="#"
                  className="block px-2 py-1 rounded transition-colors truncate"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: dark.textMute,
                  }}
                >
                  {source.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="mx-auto"
        style={{
          marginLeft: 220,
          paddingTop: 64,
          maxWidth: 740,
        }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
