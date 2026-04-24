"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { dark } from "@/lib/tokens";
import { ArticleCard } from "@/components/article-card";
import { ArticleCardSkeleton } from "@/components/ui/skeletons";
import { RankedTable } from "@/components/ranked-table";

const mono = "'JetBrains Mono', monospace";

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
}: Props) {
  const [articles, setArticles] = useState(initialArticles);
  const [likedIds, setLikedIds] = useState(initialLikedIds);
  const [bookmarkedIds, setBookmarkedIds] = useState(initialBookmarkedIds);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialArticles.length < postCount);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const likedSet = new Set(likedIds);
  const bookmarkedSet = new Set(bookmarkedIds);
  const followedSet = new Set(followedSourceIds);
  const mutedSet = new Set(mutedSourceIds);

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
        <div style={{ marginBottom: 24 }}>
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
            TOP SOURCES ON #{slug}
          </div>
          <RankedTable
            showDelta={false}
            items={topSources.map((src) => ({
              id: src.handle,
              name: src.name,
              href: `/source/${src.handle}`,
              count: src.postCount,
            }))}
          />
        </div>
      )}

      {/* ─── RECENT POSTS + SHOWING COUNT ─── */}
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
          <div
            style={{
              fontFamily: mono,
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: dark.textMute,
            }}
          >
            RECENT POSTS
          </div>
          <span style={{ fontFamily: mono, fontSize: 11, color: dark.textMute, flexShrink: 0 }}>
            showing {articles.length} of {formattedCount}
          </span>
        </div>
      </div>

      {/* ─── POSTS FEED ─── */}
      {articles.length === 0 ? (
        <p
          className="text-center py-12"
          style={{ fontFamily: mono, fontSize: 12, color: dark.textMute }}
        >
          No articles with this tag yet.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {articles.map((article) => (
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

      {articles.length > 0 && (
        <>
          <div ref={sentinelRef} style={{ minHeight: 1 }} />
          {loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          )}
        </>
      )}
      {!hasMore && articles.length > 0 && (
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
