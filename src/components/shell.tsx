import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import {
  Search, Settings,
  Sun, User,
} from "lucide-react";
import { dark } from "@/lib/tokens";
import { HeaderBreadcrumb } from "@/components/header-breadcrumb";
import { SidebarNav } from "@/components/sidebar-nav";
import { RightRail } from "@/components/right-rail";

export async function Shell({ children, rightRailTop }: { children: React.ReactNode; rightRailTop?: React.ReactNode }) {
  const supabase = createClient();

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
    <div className="min-h-screen flex flex-col" style={{ background: dark.bg, color: dark.text }}>
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
          <Image src="/logo-white.svg" alt="The Source" width={32} height={32} style={{ flexShrink: 0 }} />
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr 360px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {/* Left sidebar */}
        <aside
          className="sticky top-[64px] overflow-auto"
          style={{
            height: "calc(100vh - 64px)",
            padding: "24px 14px 40px",
            borderRight: `1px solid ${dark.line}`,
            background: dark.bg,
          }}
        >
          <SidebarNav />
        </aside>

        {/* Main content */}
        <main style={{ minWidth: 0 }}>
          {children}
        </main>

        {/* Right rail */}
        <aside
          className="sticky top-[64px] overflow-auto"
          style={{
            height: "calc(100vh - 64px)",
            padding: "24px 20px 40px",
            borderLeft: `1px solid ${dark.line}`,
            background: dark.bg,
          }}
        >
          {rightRailTop}
          <RightRail />
        </aside>
      </div>
    </div>
  );
}
