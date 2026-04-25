"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { dark } from "@/lib/tokens";
import { getSourceLogoUrl } from "@/lib/source-logo";
import { Button } from "@/components/ui/button";

type Source = {
  id: string;
  name: string;
  handle: string;
  logo_url: string | null;
  site_url: string | null;
};

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Button
      onClick={handleSignOut}
      className="btn-outline"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13,
        color: dark.danger,
        background: "none",
        border: `1px solid ${dark.dangerDim}`,
        borderRadius: 6,
        padding: "6px 14px",
      }}
    >
      Sign out
    </Button>
  );
}

export function SourceList({
  sources,
  type,
}: {
  sources: Source[];
  type: "follow" | "mute";
}) {
  const [items, setItems] = useState(sources);

  async function handleRemove(sourceId: string) {
    setItems((prev) => prev.filter((s) => s.id !== sourceId));
    const endpoint = type === "follow" ? "/api/follow" : "/api/mute";
    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_id: sourceId }),
    });
  }

  if (items.length === 0) {
    return (
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: dark.textMute }}>
        {type === "follow" ? "// not following any sources yet" : "// no muted sources"}
      </p>
    );
  }

  return (
    <div>
      {items.map((source) => (
        <div
          key={source.id}
          className="flex items-center gap-3"
          style={{
            padding: "12px 0",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {(() => {
            const logoSrc = getSourceLogoUrl(source.logo_url, source.site_url);
            return logoSrc ? (
              <img
                src={logoSrc}
                alt={source.name}
                style={{ width: 24, height: 24, borderRadius: 4, objectFit: "cover" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div
                className="flex items-center justify-center"
                style={{
                  width: 24, height: 24, borderRadius: 4, background: dark.textMute,
                  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, fontWeight: 700, color: "#fff",
                }}
              >
                {source.name.charAt(0).toUpperCase()}
              </div>
            );
          })()}
          <Link
            href={`/source/${source.handle}`}
            className="text-link flex-1"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              color: dark.text,
              textDecoration: "none",
            }}
          >
            {source.name}
          </Link>
          <Button
            onClick={() => handleRemove(source.id)}
            className="btn-outline"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12,
              color: type === "mute" ? dark.danger : dark.textDim,
              background: "none",
              border: `1px solid ${dark.line2}`,
              borderRadius: 4,
              padding: "4px 10px",
            }}
          >
            {type === "follow" ? "Unfollow" : "Unmute"}
          </Button>
        </div>
      ))}
    </div>
  );
}
