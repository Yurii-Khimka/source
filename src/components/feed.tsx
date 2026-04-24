"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ArticleCard } from "@/components/article-card";
import { ArticleCardSkeleton } from "@/components/ui/skeletons";
import { dark } from "@/lib/tokens";

const mono = "'JetBrains Mono', monospace";
const serif = "'Source Serif 4', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

type ArticleData = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
  like_count: number;
  source_id: string;
  sources: { name: string; handle: string; logo_url: string | null; site_url?: string | null } | null;
  tags: { slug: string; name: string }[];
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
  mutedTagArticleIds?: string[];
  isLoggedIn: boolean;
  followedSourceCount: number;
  todayArticleCount: number;
  tags: TagData[];
  totalCount: number;
};

const PAGE_SIZE = 20;

export function Feed({
  articles: initialArticles,
  likedIds: initialLikedIds,
  bookmarkedIds: initialBookmarkedIds,
  followedSourceIds,
  mutedSourceIds,
  mutedTagArticleIds = [],
  isLoggedIn,
  followedSourceCount,
  todayArticleCount,
  tags: initialTags,
  totalCount,
}: Props) {
  const [articles, setArticles] = useState(initialArticles);
  const [likedIds, setLikedIds] = useState(initialLikedIds);
  const [bookmarkedIds, setBookmarkedIds] = useState(initialBookmarkedIds);
  const [tags, setTags] = useState(initialTags);

  const [activeTagSlug, setActiveTagSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialArticles.length < totalCount);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const likedSet = new Set(likedIds);
  const bookmarkedSet = new Set(bookmarkedIds);
  const followedSet = new Set(followedSourceIds);
  const mutedSet = new Set(mutedSourceIds);
  const mutedTagSet = new Set(mutedTagArticleIds);

  // Filter out muted sources and muted tag articles
  const visibleArticles = articles.filter(
    (a) => !mutedSet.has(a.source_id) && !mutedTagSet.has(a.id)
  );
  const followingArticles = visibleArticles.filter((a) => followedSet.has(a.source_id));

  // Apply tag filter
  const activeTag = activeTagSlug ? tags.find((t) => t.slug === activeTagSlug) : null;
  const displayedArticles = activeTag
    ? followingArticles.filter((a) => activeTag.articleIds.includes(a.id))
    : followingArticles;

  // Load more articles
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/articles?offset=${articles.length}&limit=${PAGE_SIZE}`);
      if (!res.ok) return;
      const data = await res.json();
      const newArticles: ArticleData[] = data.articles ?? [];

      if (newArticles.length === 0) {
        setHasMore(false);
        return;
      }

      // Dedupe by id
      const existingIds = new Set(articles.map((a) => a.id));
      const unique = newArticles.filter((a) => !existingIds.has(a.id));

      if (unique.length === 0) {
        setHasMore(false);
        return;
      }

      setArticles((prev) => [...prev, ...unique]);
      setLikedIds((prev) => [...prev, ...(data.likedIds ?? [])]);
      setBookmarkedIds((prev) => [...prev, ...(data.bookmarkedIds ?? [])]);

      // Rebuild tags from all articles
      const allArticles = [...articles, ...unique];
      const tagMap = new Map<string, { id: string; slug: string; name: string; articleIds: string[]; count: number }>();
      for (const article of allArticles) {
        for (const tag of article.tags) {
          const existing = tagMap.get(tag.slug);
          if (existing) {
            existing.articleIds.push(article.id);
            existing.count++;
          } else {
            tagMap.set(tag.slug, { id: tag.slug, slug: tag.slug, name: tag.name, articleIds: [article.id], count: 1 });
          }
        }
      }
      setTags(
        Array.from(tagMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 8)
          .map(({ id, slug, name, articleIds }) => ({ id, slug, name, articleIds }))
      );

      if (articles.length + unique.length >= totalCount) {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }, [articles, loading, hasMore, totalCount]);

  // IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="page-content" style={{ padding: "22px 36px 80px" }}>
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

      {/* Sticky filter bar */}
      <div
        className="source-sticky-bar"
        style={{
          position: "sticky",
          top: 64,
          zIndex: 20,
          background: "#0A0E14",
          marginLeft: -36,
          marginRight: -36,
          paddingLeft: 36,
          paddingRight: 36,
          paddingTop: 4,
          paddingBottom: 8,
        }}
      >
      {/* Category pills + showing count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div className="category-pills-row" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
        <span className="showing-counter" style={{ fontFamily: mono, fontSize: 11, color: "#6C727E", flexShrink: 0 }}>
          showing {displayedArticles.length} of {totalCount}
        </span>
      </div>
      </div>

      {/* Article list */}
      {followedSourceIds.length === 0 ? (
        <div className="text-center" style={{ padding: "60px 0" }}>
          <h2 style={{ fontFamily: serif, fontSize: 20, fontWeight: 700, color: dark.text }}>
            Nothing here yet.
          </h2>
          <p style={{ fontFamily: sans, fontSize: 14, color: dark.textDim, marginTop: 8 }}>
            Follow sources and tags to build your feed.
          </p>
          <a
            href="/discovery"
            style={{
              display: "inline-block",
              marginTop: 20,
              padding: "8px 20px",
              borderRadius: 6,
              background: dark.accent,
              color: "#fff",
              fontFamily: sans,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Discover
          </a>
        </div>
      ) : displayedArticles.length === 0 ? (
        <p
          className="text-center py-12"
          style={{ fontFamily: mono, fontSize: 12, color: "#6C727E" }}
        >
          No articles match this filter.
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

      {/* Scroll sentinel + loading/end state */}
      <div ref={sentinelRef} style={{ minHeight: 1 }} />
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      )}
      {!hasMore && displayedArticles.length > 0 && (
        <p
          className="text-center"
          style={{ fontFamily: mono, fontSize: 11, color: "#6C727E", marginTop: 32, marginBottom: 16 }}
        >
          {"// caught up · The Source never serves you posts out of order"}
        </p>
      )}
    </div>
  );
}
