"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  Users,
  Info,
  ShieldCheck,
  Lock,
  FileText,
  ExternalLink,
  Settings,
  LogOut,
} from "lucide-react";
import { dark } from "@/lib/tokens";
import { createClient } from "@/lib/supabase/client";

const mono = "'JetBrains Mono', monospace";
const sans = "'Inter', system-ui, sans-serif";

type UserProfile = {
  user: { id: string; email: string } | null;
  profile: { avatar_url: string | null; display_name: string | null; handle?: string } | null;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 1.2,
        color: dark.textMute,
        padding: "16px 0 8px",
      }}
    >
      {children}
    </div>
  );
}

function MenuRow({
  href,
  icon: Icon,
  label,
  external,
}: {
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  label: string;
  external?: boolean;
}) {
  const content = (
    <div
      className="source-row"
      style={{
        display: "flex",
        alignItems: "center",
        height: 48,
        padding: "0 4px",
        gap: 12,
      }}
    >
      <Icon size={18} style={{ color: dark.textDim, flexShrink: 0 }} />
      <span
        style={{
          flex: 1,
          fontFamily: sans,
          fontSize: 14,
          color: dark.text,
        }}
      >
        {label}
      </span>
      <ChevronRight size={16} style={{ color: dark.textMute, flexShrink: 0 }} />
    </div>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      {content}
    </Link>
  );
}

export default function MobileProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user-profile")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const user = data?.user ?? null;
  const profile = data?.profile ?? null;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center", fontFamily: mono, fontSize: 12, color: dark.textMute }}>
        Loading...
      </div>
    );
  }

  const dividerStyle: React.CSSProperties = {
    borderTop: `1px solid ${dark.line}`,
    margin: 0,
  };

  return (
    <div style={{ padding: "24px 0 80px" }}>
      {/* User identity */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        {user && profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: dark.surface2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: sans,
              fontSize: 18,
              fontWeight: 700,
              color: dark.textMute,
            }}
          >
            {user ? (profile?.display_name?.[0] ?? user.email[0]).toUpperCase() : "?"}
          </div>
        )}
        <div>
          {user ? (
            <>
              <div style={{ fontFamily: sans, fontSize: 16, fontWeight: 600, color: dark.text }}>
                {profile?.display_name ?? "User"}
              </div>
              <div style={{ fontFamily: mono, fontSize: 12, color: dark.textMute }}>
                {user.email}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: sans, fontSize: 14, color: dark.textSub, lineHeight: 1.5 }}>
                Sign in to follow sources, bookmark articles, and more.
              </div>
              <Link
                href="/auth/signin"
                className="btn-primary"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  background: dark.accent,
                  color: "#fff",
                  fontFamily: sans,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: "8px 20px",
                  borderRadius: 6,
                  textDecoration: "none",
                }}
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>

      <div style={dividerStyle} />

      {/* Your content */}
      <SectionLabel>Your content</SectionLabel>
      <MenuRow href="/following" icon={Users} label="Following" />

      <div style={dividerStyle} />

      {/* Info */}
      <SectionLabel>Info</SectionLabel>
      <MenuRow href="/about" icon={Info} label="About" />
      <MenuRow href="/trust" icon={ShieldCheck} label="Trust Standards" />
      <MenuRow href="/privacy" icon={Lock} label="Privacy" />
      <MenuRow href="/terms" icon={FileText} label="Terms" />
      <MenuRow href="https://github.com/Yurii-Khimka/source" icon={ExternalLink} label="GitHub" external />

      {user && (
        <>
          <div style={dividerStyle} />

          {/* Account */}
          <SectionLabel>Account</SectionLabel>
          <MenuRow href="/settings" icon={Settings} label="Settings" />
          <button
            onClick={handleSignOut}
            className="source-row cursor-pointer"
            style={{
              display: "flex",
              alignItems: "center",
              height: 48,
              padding: "0 4px",
              gap: 12,
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <LogOut size={18} style={{ color: dark.danger, flexShrink: 0 }} />
            <span
              style={{
                flex: 1,
                fontFamily: sans,
                fontSize: 14,
                color: dark.danger,
                textAlign: "left",
              }}
            >
              Sign out
            </span>
          </button>
        </>
      )}
    </div>
  );
}
