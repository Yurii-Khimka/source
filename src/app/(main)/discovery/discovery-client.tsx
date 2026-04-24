"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, ShieldCheck, X } from "lucide-react";
import { RankedTable } from "@/components/ranked-table";
import { dark } from "@/lib/tokens";
import { ArticleCard } from "@/components/article-card";
import { Spinner } from "@/components/ui/spinner";

const mono = "'JetBrains Mono', monospace";
const serif = "'Source Serif 4', Georgia, serif";
const inter = "'Inter', system-ui, sans-serif";

type Source = {
  id: string;
  handle: string;
  name: string;
  site_url: string | null;
  verification_status: string | null;
  followers_count: number;
};

type Tag = {
  id: string;
  slug: string;
  name: string;
  count: number;
  delta: number | null; // null = "new"
};

type ArticleData = {
  article: {
    id: string;
    title: string;
    description: string | null;
    url: string;
    image_url: string | null;
    published_at: string | null;
    like_count: number;
    source_id: string;
    sources: { name: string; handle: string; logo_url: string | null } | null;
    tags?: { slug: string; name: string }[];
  };
  initialLiked: boolean;
  initialLikeCount: number;
  initialBookmarked: boolean;
  initialFollowing: boolean;
  initialMuted: boolean;
  sourceId: string;
};

type Tab = "all" | "sources" | "tags";

type Props = {
  sources: Source[];
  tags: Tag[];
  followedSourceIds: string[];
  isLoggedIn: boolean;
  articles: ArticleData[];
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

export function DiscoveryClient({
  sources,
  tags,
  followedSourceIds,
  isLoggedIn,
  articles,
}: Props) {
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

  // Sources tab: filter posts to sources visible in grid (+ search if active)
  const sourcePostArticles = useMemo(() => {
    const sourceIds = new Set(filteredSources.map((s) => s.id));
    let filtered = articles.filter((a) => sourceIds.has(a.article.source_id));
    if (query) {
      filtered = filtered.filter(
        (a) =>
          a.article.title.toLowerCase().includes(query) ||
          (a.article.description ?? "").toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [articles, filteredSources, query]);

  // Tags tab: articles that have at least one tag
  const taggedArticles = useMemo(
    () => articles.filter((a) => a.article.tags && a.article.tags.length > 0),
    [articles]
  );

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
      window.dispatchEvent(new CustomEvent("followChanged"));
    } catch {
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

  const tabItems: { key: Tab; label: string; count: number }[] = [
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
        }}
      >
        <h1
          style={{
            fontFamily: serif,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: -0.5,
            color: dark.text,
            margin: 0,
          }}
        >
          Discovery
        </h1>
        <span
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: dark.textMute,
            textAlign: "right",
            marginTop: 6,
          }}
        >
          verified sources & tags only · no algorithmic boosts
        </span>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", marginTop: 18, marginBottom: 20 }}>
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
          placeholder="Search verified sources, tags, or headlines…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
          style={{
            width: "100%",
            background: dark.surface,
            border: `1px solid ${dark.line}`,
            borderRadius: 4,
            padding: "10px 40px 10px 40px",
            fontFamily: inter,
            fontSize: 14,
            color: dark.text,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: 4,
              cursor: "pointer",
              color: dark.textMute,
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Tabs — underline style */}
      <div
        style={{
          display: "flex",
          gap: 24,
          borderBottom: `1px solid ${dark.line}`,
          marginBottom: 28,
        }}
      >
        {tabItems.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                fontFamily: inter,
                fontSize: 13,
                fontWeight: 500,
                color: active ? dark.text : dark.textDim,
                background: "none",
                border: "none",
                borderBottom: active ? `2px solid ${dark.accent}` : "2px solid transparent",
                padding: "8px 0",
                marginBottom: -1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "color 0.12s",
              }}
            >
              {tab.label}
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  background: dark.surface2,
                  border: `1px solid ${dark.line2}`,
                  borderRadius: 3,
                  padding: "1px 5px",
                  lineHeight: 1.4,
                  color: active ? dark.textDim : dark.textMute,
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
                    padding: 14,
                  }}
                >
                  {/* Avatar + info row */}
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <Link href={`/source/${source.handle}`} className="flex-shrink-0" style={{ textDecoration: "none" }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 6,
                          background: handleToColor(source.handle),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          fontFamily: inter,
                          fontSize: 15,
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        {getInitials(source.name)}
                      </div>
                    </Link>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Link
                          href={`/source/${source.handle}`}
                          style={{
                            fontFamily: serif,
                            fontSize: 16,
                            fontWeight: 700,
                            color: dark.text,
                            textDecoration: "none",
                          }}
                        >
                          {source.name}
                        </Link>
                        <ShieldCheck
                          size={13}
                          style={{ color: dark.accent, flexShrink: 0 }}
                        />
                      </div>
                      <div
                        style={{
                          fontFamily: mono,
                          fontSize: 11,
                          color: dark.textMute,
                          marginTop: 2,
                        }}
                      >
                        @{source.handle} · {source.followers_count} · corr 0.00%
                      </div>
                    </div>
                  </div>

                  {/* Buttons row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                    <button
                      onClick={() => toggleFollow(source.id)}
                      disabled={isLoading || !isLoggedIn}
                      style={{
                        fontFamily: mono,
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "5px 14px",
                        borderRadius: 4,
                        cursor: isLoading ? "wait" : isLoggedIn ? "pointer" : "default",
                        transition: "all 0.12s",
                        background: isFollowing ? "transparent" : dark.accent,
                        color: isFollowing ? dark.accent : "#fff",
                        border: isFollowing
                          ? `1px solid ${dark.accentLine}`
                          : `1px solid ${dark.accent}`,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {isLoading && <Spinner />}
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

      {/* Tags section — table layout */}
      {showTags && filteredTags.length > 0 && (
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
            TRENDING TAGS · 24H
          </div>
          <RankedTable
            items={filteredTags.map((tag) => ({
              id: tag.id,
              name: tag.name,
              href: `/tag/${tag.slug}`,
              count: tag.count,
              delta: tag.delta,
              prefix: "#",
            }))}
          />
        </div>
      )}

      {/* All tab — ALL POSTS section */}
      {activeTab === "all" && articles.length > 0 && (
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
            ALL POSTS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {articles.map((a) => (
              <ArticleCard
                key={a.article.id}
                article={a.article}
                initialLiked={a.initialLiked}
                initialLikeCount={a.initialLikeCount}
                initialBookmarked={a.initialBookmarked}
                initialFollowing={a.initialFollowing}
                initialMuted={a.initialMuted}
                sourceId={a.sourceId}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sources tab — POSTS FROM THESE SOURCES */}
      {activeTab === "sources" && sourcePostArticles.length > 0 && (
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
            POSTS FROM THESE SOURCES
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {sourcePostArticles.map((a) => (
              <ArticleCard
                key={a.article.id}
                article={a.article}
                initialLiked={a.initialLiked}
                initialLikeCount={a.initialLikeCount}
                initialBookmarked={a.initialBookmarked}
                initialFollowing={a.initialFollowing}
                initialMuted={a.initialMuted}
                sourceId={a.sourceId}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tags tab — RECENT POSTS */}
      {activeTab === "tags" && taggedArticles.length > 0 && (
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
            RECENT POSTS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {taggedArticles.map((a) => (
              <ArticleCard
                key={a.article.id}
                article={a.article}
                initialLiked={a.initialLiked}
                initialLikeCount={a.initialLikeCount}
                initialBookmarked={a.initialBookmarked}
                initialFollowing={a.initialFollowing}
                initialMuted={a.initialMuted}
                sourceId={a.sourceId}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredSources.length === 0 && filteredTags.length === 0 && (
        <p
          style={{
            fontFamily: mono,
            fontSize: 12,
            color: dark.textMute,
            textAlign: "center",
            paddingTop: 48,
          }}
        >
          No results found
        </p>
      )}
    </div>
  );
}
