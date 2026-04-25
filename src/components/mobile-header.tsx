"use client";

import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { dark } from "@/lib/tokens";

export function MobileHeader() {
  return (
    <header
      className="mobile-header"
      style={{
        display: "none",
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 56,
        background: dark.bg,
        borderBottom: `1px solid ${dark.line}`,
        padding: "0 16px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-[10px]" style={{ textDecoration: "none" }}>
        <Image src="/logo-white.svg" alt="The Source" width={32} height={32} style={{ flexShrink: 0 }} />
        <div style={{ lineHeight: 1.3 }}>
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 800,
              color: dark.text,
              letterSpacing: 0.8,
            }}
          >
            THE SOURCE
          </div>
          <div
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 10,
              color: dark.textDim,
            }}
          >
            Source of Truth
          </div>
        </div>
      </Link>

      {/* Icons */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Link
          href="/search"
          className="header-icon-btn"
          style={{
            width: 44,
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: dark.textDim,
            background: "transparent",
            border: "none",
            borderRadius: 6,
          }}
        >
          <Search size={20} />
        </Link>

      </div>
    </header>
  );
}
