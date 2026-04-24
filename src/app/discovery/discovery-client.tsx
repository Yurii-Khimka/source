"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ShieldCheck } from "lucide-react";
import { dark } from "@/lib/tokens";

const mono = "'JetBrains Mono', monospace";
const serif = "'Source Serif 4', Georgia, serif";
const inter = "'Inter', system-ui, sans-serif";

type Source = {
  id: string;
  handle: string;
  name: string;
  site_url: string | null;
  verification_status: string | null;
};

type Tag = {
  id: string;
  slug: string;
  name: string;
  count: number;
};

type Tab = "all" | "sources" | "tags";

type Props = {
  sources: Source[];
  tags: Tag[];
  followedSourceIds: string[];
  isLoggedIn: boolean;
};

function handleToColor(handle: string): string {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = handle.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#3d5a80", "#e0b14f", "#ee6c4d", "#5b8fb9",
    "#9c6ade", "#44bd8f", "#cf6a87", "#4a9ec5",
    "#d4845a", "#7b6bb5",
  ];
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function DiscoveryClient({ sources, tags, followedSourceIds, isLoggedIn }: Props) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set(followedSourceIds));
  const [loadingFollow, setLoadingFollow] = useState<Set<string>>(new Set());

  const query = search.toLowerCase().trim();

  const filteredSources = useMemo(
    () =>
      sources.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.handle.toLowerCase().includes(query)
      ),
    [sources, query]
  );

  const filteredTags = useMemo(
    () =>
      tags.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.slug.toLowerCase().includes(query)
      ),
    [tags, query]
  );

  const showSources = activeTab === "all" || activeTab === "sources";
  const showTags = activeTab === "all" || activeTab === "tags";

  async function toggleFollow(sourceId: string) {
    if (!isLoggedIn) return;
    setLoadingFollow((prev) => new Set(prev).add(sourceId));

    const wasFollowing = followedIds.has(sourceId);
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (wasFollowing) next.delete(sourceId);
      else next.add(sourceId);
      return next;
    });

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_id: sourceId }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert on error
      setFollowedIds((prev) => {
        const next = new Set(prev);
        if (wasFollowing) next.add(sourceId);
        else next.delete(sourceId);
        return next;
      });
    } finally {
      setLoadingFollow((prev) => {
        const next = new Set(prev);
        next.delete(sourceId);
        return next;
      });
    }
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: filteredSources.length + filteredTags.length },
    { key: "sources", label: "Sources", count: filteredSources.length },
    { key: "tags", label: "Tags", count: filteredTags.length },
  ];

  return (
    <div style={{ padding: "32px 36px 60px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontFamily: serif,
            fontSize: 24,
            fontWeight: 700,
            color: dark.text,
            margin: 0,
          }}
        >
          Discovery
        </h1>
        <span
          style={{
            fontFamily: mono,
            fontSize: 12,
            color: dark.textMute,
            textAlign: "right",
            marginTop: 4,
          }}
        >
          verified sources & tags only · no algorithmic boosts
        </span>
      </div>

      {/* Search bar */}
      <div
        style={{
          position: "relative",
          marginBottom: 20,
        }}
      >
        <Search
          size={16}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: dark.textMute,
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder="Search verified sources, tags, or headlines..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            background: dark.surface,
            border: `1px solid ${dark.line}`,
            borderRadius: 4,
            padding: "10px 14px 10px 40px",
            fontFamily: inter,
            fontSize: 14,
            color: dark.text,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                fontFamily: mono,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 3,
                cursor: "pointer",
                transition: "background 0.12s, border-color 0.12s",
                background: active ? dark.accentDim : dark.surface,
                color: active ? dark.accent : dark.textDim,
                border: active
                  ? `1px solid ${dark.accentLine}`
                  : `1px solid ${dark.line2}`,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {tab.label}
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  color: active ? dark.accent : dark.textMute,
                  background: active ? "transparent" : dark.surface2,
                  border: active ? "none" : `1px solid ${dark.line2}`,
                  borderRadius: 3,
                  padding: "1px 5px",
                  lineHeight: 1.4,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sources section */}
      {showSources && filteredSources.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: dark.textMute,
              marginBottom: 14,
            }}
          >
            VERIFIED SOURCES · {filteredSources.length}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {filteredSources.map((source) => {
              const isFollowing = followedIds.has(source.id);
              const isLoading = loadingFollow.has(source.id);
              return (
                <div
                  key={source.id}
                  style={{
                    background: dark.surface,
                    border: `1px solid ${dark.line}`,
                    borderRadius: 6,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  {/* Top row: avatar + info */}
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    {/* Avatar */}
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 6,
                        background: handleToColor(source.handle),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontFamily: inter,
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {getInitials(source.name)}
                    </div>
                    {/* Name + handle */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            fontFamily: inter,
                            fontSize: 15,
                            fontWeight: 600,
                            color: dark.text,
                          }}
                        >
                          {source.name}
                        </span>
                        <ShieldCheck
                          size={14}
                          style={{ color: dark.accent, flexShrink: 0 }}
                        />
                      </div>
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 12,
                          color: dark.textMute,
                          marginTop: 2,
                        }}
                      >
                        @{source.handle} · corr 0.00%
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button
                      onClick={() => toggleFollow(source.id)}
                      disabled={isLoading || !isLoggedIn}
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "5px 14px",
                        borderRadius: 4,
                        cursor: isLoggedIn ? "pointer" : "default",
                        transition: "all 0.12s",
                        background: isFollowing ? dark.accentDim : "transparent",
                        color: isFollowing ? dark.accent : dark.textDim,
                        border: isFollowing
                          ? `1px solid ${dark.accentLine}`
                          : `1px solid ${dark.line2}`,
                        opacity: isLoading ? 0.5 : 1,
                      }}
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </button>
                    <Link
                      href={`/source/${source.handle}`}
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        color: dark.textMute,
                        textDecoration: "none",
                        transition: "color 0.12s",
                      }}
                    >
                      View profile →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags section */}
      {showTags && filteredTags.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: dark.textMute,
              marginBottom: 14,
            }}
          >
            TRENDING TAGS · 24H
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {filteredTags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tag/${tag.slug}`}
                style={{
                  background: dark.surface,
                  border: `1px solid ${dark.line}`,
                  borderRadius: 6,
                  padding: 20,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "border-color 0.12s",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 18,
                      fontWeight: 700,
                      color: dark.text,
                    }}
                  >
                    #{tag.name}
                  </div>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 12,
                      color: dark.textMute,
                      marginTop: 4,
                    }}
                  >
                    {tag.count} posts
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty states */}
      {showSources && filteredSources.length === 0 && showTags && filteredTags.length === 0 && (
        <p
          style={{
            fontFamily: mono,
            fontSize: 12,
            color: dark.textMute,
            textAlign: "center",
            paddingTop: 48,
          }}
        >
          No results match &ldquo;{search}&rdquo;
        </p>
      )}
    </div>
  );
}
