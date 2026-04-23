"use client";

import { useState } from "react";
import { ArticleCard } from "@/components/article-card";

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

type Props = {
  articles: ArticleData[];
  likedIds: string[];
  bookmarkedIds: string[];
  followedSourceIds: string[];
  mutedSourceIds: string[];
  isLoggedIn: boolean;
};

export function Feed({ articles, likedIds, bookmarkedIds, followedSourceIds, mutedSourceIds, isLoggedIn }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "following">("all");

  const likedSet = new Set(likedIds);
  const bookmarkedSet = new Set(bookmarkedIds);
  const followedSet = new Set(followedSourceIds);
  const mutedSet = new Set(mutedSourceIds);

  // Filter out muted sources
  const visibleArticles = articles.filter((a) => !mutedSet.has(a.source_id));

  // Apply tab filter
  const displayedArticles = activeTab === "following"
    ? visibleArticles.filter((a) => followedSet.has(a.source_id))
    : visibleArticles;

  const tabBase = {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 14,
    paddingBottom: 10,
    cursor: "pointer" as const,
    background: "none" as const,
    border: "none" as const,
  };

  return (
    <>
      {/* Feed header */}
      <div className="mb-4">
        <h1
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: 24,
            fontWeight: 700,
            color: "#EEF1F6",
          }}
        >
          Your feed
        </h1>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#6C727E",
            marginTop: 4,
          }}
        >
          chronological · no algorithm · {displayedArticles.length} articles
        </p>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-6 mb-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={() => setActiveTab("all")}
          style={{
            ...tabBase,
            color: activeTab === "all" ? "#EEF1F6" : "#6C727E",
            borderBottom: activeTab === "all" ? "2px solid rgb(100,104,240)" : "2px solid transparent",
          }}
        >
          All sources
        </button>
        <button
          onClick={() => setActiveTab("following")}
          style={{
            ...tabBase,
            color: activeTab === "following" ? "#EEF1F6" : "#6C727E",
            borderBottom: activeTab === "following" ? "2px solid rgb(100,104,240)" : "2px solid transparent",
          }}
        >
          Following
        </button>
      </div>

      {/* Article list */}
      {activeTab === "following" && !isLoggedIn ? (
        <p
          className="text-center py-12"
          style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: "#6C727E" }}
        >
          Sign in to follow sources
        </p>
      ) : activeTab === "following" && displayedArticles.length === 0 ? (
        <p
          className="text-center py-12"
          style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: "#6C727E" }}
        >
          Follow some sources to see them here
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: "#6C727E",
          marginTop: 32,
          marginBottom: 16,
        }}
      >
        {"// caught up · The Source never serves you posts out of order"}
      </p>
    </>
  );
}
