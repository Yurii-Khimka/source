"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { dark } from "@/lib/tokens";
import { ArticleCard } from "@/components/article-card";
import { ArticleCardSkeleton } from "@/components/ui/skeletons";

const mono = "'JetBrains Mono', monospace";
const inter = "'Inter', system-ui, sans-serif";

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
  tags: { slug: string; name: string }[];
};

type TopSource = {
  handle: string;
  name: string;
  logo_url: string | null;
  postCount: number;
};

type TagData = {
  id: string;
  slug: string;
  name: string;
  articleIds: string[];
};

type Props = {
  slug: string;
  postCount: number;
  topSources: TopSource[];
  articles: ArticleData[];
  likedIds: string[];
  bookmarkedIds: string[];
  followedSourceIds: string[];
  mutedSourceIds: string[];
  isLoggedIn: boolean;
  tags: TagData[];
};

const PAGE_SIZE = 20;

export function TagProfileClient({
  slug,
  postCount,
  topSources,
  articles: initialArticles,
  likedIds: initialLikedIds,
  bookmarkedIds: initialBookmarkedIds,
  followedSourceIds,
  mutedSourceIds,
  isLoggedIn,
  tags: initialTags,
}: Props) {
  const [articles, setArticles] = useState(initialArticles);
  const [likedIds, setLikedIds] = useState(initialLikedIds);
  const [bookmarkedIds, setBookmarkedIds] = useState(initialBookmarkedIds);
  const [tags, setTags] = useState(initialTags);
  const [activeTagSlug, setActiveTagSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialArticles.length < postCount);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const likedSet = new Set(likedIds);
  const bookmarkedSet = new Set(bookmarkedIds);
  const followedSet = new Set(followedSourceIds);
  const mutedSet = new Set(mutedSourceIds);

  const activeTag = activeTagSlug ? tags.find((t) => t.slug === activeTagSlug) : null;
  const displayedArticles = activeTag
    ? articles.filter((a) => activeTag.articleIds.includes(a.id))
    : articles;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/articles?offset=${articles.length}&limit=${PAGE_SIZE}&tag_slug=${slug}`
      );
      if (!res.ok) return;
      const data = await res.json();
      const newArticles: ArticleData[] = data.articles ?? [];

      if (newArticles.length === 0) {
        setHasMore(false);
        return;
      }

      const existingIds = new Set(articles.map((a) => a.id));
      const unique = newArticles.filter((a) => !existingIds.has(a.id));

      if (unique.length === 0) {
        setHasMore(false);
        return;
      }

      setArticles((prev) => [...prev, ...unique]);
      setLikedIds((prev) => [...prev, ...(data.likedIds ?? [])]);
      setBookmarkedIds((prev) => [...prev, ...(data.bookmarkedIds ?? [])]);

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

      if (articles.length + unique.length >= postCount) {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }, [articles, loading, hasMore, postCount, slug]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const formattedCount = postCount.toLocaleString();

  return (
    <div style={{ padding: "32px 36px 80px" }}>
      {/* ─── IDENTITY HEADER ─── */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: mono,
            fontSize: 28,
            fontWeight: 700,
            color: dark.accent,
            margin: 0,
          }}
        >
          #{slug}
        </h1>
        <p
          style={{
            fontFamily: mono,
            fontSize: 12,
            color: dark.textMute,
            marginTop: 6,
          }}
        >
          {formattedCount} posts
        </p>
      </div>

      {/* ─── TOP SOURCES ON #TAG ─── */}
      {topSources.length > 0 && (
        <div
          style={{
            background: dark.surface,
            border: `1px solid ${dark.line}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: dark.textMute,
              marginBottom: 14,
            }}
          >
            TOP SOURCES ON #{slug}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topSources.map((src, i) => (
              <div
                key={src.handle}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    color: dark.textMute,
                    width: 18,
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>

                <Link href={`/source/${src.handle}`} className="flex-shrink-0" style={{ textDecoration: "none" }}>
                  {src.logo_url ? (
                    <img
                      src={src.logo_url}
                      alt={src.name}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        objectFit: "cover",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        background: dark.surface2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontFamily: inter,
                        fontSize: 10,
                        fontWeight: 700,
                        color: dark.textDim,
                      }}
                    >
                      {src.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </Link>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/source/${src.handle}`}
                    style={{
                      fontFamily: inter,
                      fontSize: 13,
                      fontWeight: 600,
                      color: dark.text,
                      textDecoration: "none",
                    }}
                  >
                    {src.name}
                  </Link>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: dark.textMute,
                      marginLeft: 6,
                    }}
                  >
                    @{src.handle}
                  </span>
                </div>

                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    color: dark.textMute,
                    flexShrink: 0,
                  }}
                >
                  {src.postCount.toLocaleString()} posts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CATEGORY PILLS + SHOWING COUNT ─── */}
      <div
        style={{
          position: "sticky",
          top: 64,
          zIndex: 20,
          background: dark.bg,
          marginLeft: -36,
          marginRight: -36,
          paddingLeft: 36,
          paddingRight: 36,
          paddingTop: 4,
          paddingBottom: 8,
        }}
      >
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
                    background: active ? dark.accentDim : dark.surface,
                    color: active ? dark.accent : dark.textDim,
                    border: active
                      ? `1px solid ${dark.accentLine}`
                      : `1px solid ${dark.line2}`,
                  }}
                >
                  {pill.name}
                </button>
              );
            })}
          </div>
          <span style={{ fontFamily: mono, fontSize: 11, color: dark.textMute, flexShrink: 0 }}>
            showing {displayedArticles.length} of {formattedCount}
          </span>
        </div>
      </div>

      {/* ─── POSTS FEED ─── */}
      {displayedArticles.length === 0 ? (
        <p
          className="text-center py-12"
          style={{ fontFamily: mono, fontSize: 12, color: dark.textMute }}
        >
          {activeTagSlug ? "No articles match this filter." : "No articles with this tag yet."}
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
          style={{ fontFamily: mono, fontSize: 11, color: dark.textMute, marginTop: 32, marginBottom: 16 }}
        >
          {"// end of posts for this tag"}
        </p>
      )}
    </div>
  );
}
