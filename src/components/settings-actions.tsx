"use client";

import { useState } from "react";
import Link from "next/link";
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

type Tag = {
  id: string;
  slug: string;
  label: string;
};

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
            borderBottom: `1px solid ${dark.hover}`,
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
                  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--on-accent)",
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

export function TagList({ tags }: { tags: Tag[] }) {
  const [items, setItems] = useState(tags);

  async function handleRemove(tagId: string) {
    setItems((prev) => prev.filter((t) => t.id !== tagId));
    await fetch("/api/mute-tag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_id: tagId }),
    });
  }

  if (items.length === 0) {
    return (
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: dark.textMute }}>
        {"// no muted tags"}
      </p>
    );
  }

  return (
    <div>
      {items.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-3"
          style={{
            padding: "12px 0",
            borderBottom: `1px solid ${dark.hover}`,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              color: dark.accent,
              width: 24,
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            #
          </span>
          <Link
            href={`/tag/${tag.slug}`}
            className="text-link flex-1"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              color: dark.text,
              textDecoration: "none",
            }}
          >
            {tag.label}
          </Link>
          <Button
            onClick={() => handleRemove(tag.id)}
            className="btn-outline"
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 12,
              color: dark.danger,
              background: "none",
              border: `1px solid ${dark.line2}`,
              borderRadius: 4,
              padding: "4px 10px",
            }}
          >
            Unmute
          </Button>
        </div>
      ))}
    </div>
  );
}
