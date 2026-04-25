"use client";

import Link from "next/link";
import useSWR from "swr";
import Image from "next/image";
import {
  Search, Settings,
  Sun, User,
} from "lucide-react";
import { dark } from "@/lib/tokens";
import { HeaderBreadcrumb } from "@/components/header-breadcrumb";
import { SidebarNav } from "@/components/sidebar-nav";
import { RightRail } from "@/components/right-rail";
import { useRightRailTop } from "@/components/right-rail-context";
import { MobileHeader } from "@/components/mobile-header";
import { BottomTabBar } from "@/components/bottom-tab-bar";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type UserProfileData = {
  user: { id: string; email: string } | null;
  profile: { avatar_url: string | null; display_name: string | null } | null;
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { topContent } = useRightRailTop();

  const { data } = useSWR<UserProfileData>("/api/user-profile", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const user = data?.user ?? null;
  const profile = data?.profile ?? null;

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
      {/* Mobile header — visible only at <=768px via CSS */}
      <MobileHeader />

      {/* Desktop header — hidden at <=768px via CSS */}
      <header
        className="desktop-header sticky top-0 z-30"
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
                fontWeight: 700,
                color: dark.text,
                letterSpacing: 0.8,
              }}
            >
              THE SOURCE
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
        className="app-body"
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr 360px",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        {/* Left sidebar */}
        <aside
          className="desktop-sidebar sticky top-[64px] overflow-auto"
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
        <main className="main-content" style={{ minWidth: 0 }}>
          {children}
        </main>

        {/* Right rail */}
        <aside
          className="desktop-right-rail sticky top-[64px] overflow-auto"
          style={{
            height: "calc(100vh - 64px)",
            padding: "24px 20px 40px",
            borderLeft: `1px solid ${dark.line}`,
            background: dark.bg,
          }}
        >
          {topContent}
          <RightRail />
        </aside>
      </div>

      {/* Bottom tab bar — visible only at <=768px via CSS */}
      <BottomTabBar />
    </div>
  );
}
