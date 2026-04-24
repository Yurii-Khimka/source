"use client";

import { useState } from "react";
import { ArticleCard } from "@/components/article-card";

const inter = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";
const serif = "'Source Serif 4', Georgia, serif";

type ArticleData = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
  like_count: number;
  source_id: string;
  sources: { name: string; handle: string; logo_url: string | null } | null;
};

type TagData = {
  id: string;
  slug: string;
  name: string;
  articleIds: string[];
};

type Props = {
  articles: ArticleData[];
  likedIds: string[];
  bookmarkedIds: string[];
  followedSourceIds: string[];
  mutedSourceIds: string[];
  isLoggedIn: boolean;
  followedSourceCount: number;
  todayArticleCount: number;
  tags: TagData[];
};

export function Feed({
  articles,
  likedIds,
  bookmarkedIds,
  followedSourceIds,
  mutedSourceIds,
  isLoggedIn,
  followedSourceCount,
  todayArticleCount,
  tags,
}: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "following">(
    isLoggedIn ? "following" : "all"
  );
  const [activeTagSlug, setActiveTagSlug] = useState<string | null>(null);

  const counterBadge: React.CSSProperties = {
    fontFamily: mono,
    fontSize: 10,
    color: "#6C727E",
    background: "#161B26",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 3,
    padding: "1px 5px",
    marginLeft: 6,
    verticalAlign: "middle",
  };

  const likedSet = new Set(likedIds);
  const bookmarkedSet = new Set(bookmarkedIds);
  const followedSet = new Set(followedSourceIds);
  const mutedSet = new Set(mutedSourceIds);

  // Filter out muted sources
  const visibleArticles = articles.filter((a) => !mutedSet.has(a.source_id));
  const followingArticles = visibleArticles.filter((a) => followedSet.has(a.source_id));

  // Apply tab filter
  const tabFiltered = activeTab === "following"
    ? followingArticles
    : visibleArticles;

  // Apply tag filter
  const activeTag = activeTagSlug ? tags.find((t) => t.slug === activeTagSlug) : null;
  const displayedArticles = activeTag
    ? tabFiltered.filter((a) => activeTag.articleIds.includes(a.id))
    : tabFiltered;

  return (
    <div style={{ padding: "22px 36px 80px" }}>
      {/* Markets ticker card */}
      <div
        style={{
          background: "#11151D",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          padding: "14px 16px",
          marginBottom: 16,
        }}
      >
        {/* Ticker bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, marginBottom: 14, marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "rgb(68,189,56)",
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontFamily: mono,
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: 1.2,
                color: "rgb(68,189,56)",
              }}
            >
              Markets
            </span>
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              color: "#6C727E",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            EUR/USD 1.0842 ▲ · USD/JPY 154.32 ▼ · GER40 18,234 ▲ · DXY 104.21 ▼
          </div>
          <span
            style={{
              fontFamily: mono,
              fontSize: 10,
              color: "#6C727E",
              flexShrink: 0,
            }}
          >
            live
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily: serif,
            fontSize: 24,
            fontWeight: 700,
            color: "#EEF1F6",
            margin: 0,
          }}
        >
          Your timeline
        </h1>
        <p
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: "#6C727E",
            marginTop: 4,
          }}
        >
          {followedSourceCount} sources · {todayArticleCount} articles today · chronological · no algorithm
        </p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 12 }}
      >
        <button
          onClick={() => setActiveTab("following")}
          style={{
            fontFamily: inter,
            fontSize: 14,
            fontWeight: 500,
            padding: "10px 16px",
            cursor: "pointer",
            background: "none",
            border: "none",
            color: activeTab === "following" ? "#EEF1F6" : "#A3ACBD",
            borderBottom: activeTab === "following"
              ? "2px solid rgb(100,104,240)"
              : "2px solid transparent",
          }}
        >
          Following {isLoggedIn && (
            <span style={counterBadge}>{followingArticles.length}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          style={{
            fontFamily: inter,
            fontSize: 14,
            fontWeight: 500,
            padding: "10px 16px",
            cursor: "pointer",
            background: "none",
            border: "none",
            color: activeTab === "all" ? "#EEF1F6" : "#A3ACBD",
            borderBottom: activeTab === "all"
              ? "2px solid rgb(100,104,240)"
              : "2px solid transparent",
          }}
        >
          All sources <span style={counterBadge}>{visibleArticles.length}</span>
        </button>
      </div>

      {/* Category pills + showing count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[{ slug: null, name: "ALL" }, ...tags.map((t) => ({ slug: t.slug, name: t.name }))].map((pill) => {
            const active = pill.slug === activeTagSlug;
            return (
              <button
                key={pill.slug ?? "all"}
                onClick={() => setActiveTagSlug(pill.slug)}
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
                  background: active ? "rgba(100,104,240,0.16)" : "#11151D",
                  color: active ? "rgb(100,104,240)" : "#A3ACBD",
                  border: active
                    ? "1px solid rgba(100,104,240,0.42)"
                    : "1px solid rgba(255,255,255,0.10)",
                }}
              >
                {pill.name}
              </button>
            );
          })}
        </div>
        <span style={{ fontFamily: mono, fontSize: 11, color: "#6C727E" }}>
          showing {displayedArticles.length} of {visibleArticles.length}
        </span>
      </div>

      {/* Article list */}
      {activeTab === "following" && !isLoggedIn ? (
        <p
          className="text-center py-12"
          style={{ fontFamily: inter, fontSize: 14, color: "#6C727E" }}
        >
          Sign in to follow sources
        </p>
      ) : activeTab === "following" && displayedArticles.length === 0 ? (
        <p
          className="text-center py-12"
          style={{ fontFamily: inter, fontSize: 14, color: "#6C727E" }}
        >
          Follow some sources to see them here
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {displayedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              initialLiked={likedSet.has(article.id)}
              initialLikeCount={article.like_count}
              initialBookmarked={bookmarkedSet.has(article.id)}
              initialFollowing={followedSet.has(article.source_id)}
              initialMuted={mutedSet.has(article.source_id)}
              sourceId={article.source_id}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}

      {/* Footer message */}
      <p
        className="text-center"
        style={{
          fontFamily: mono,
          fontSize: 11,
          color: "#6C727E",
          marginTop: 32,
          marginBottom: 16,
        }}
      >
        {"// caught up · The Source never serves you posts out of order"}
      </p>
    </div>
  );
}
