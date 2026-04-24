"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Globe, UserPlus, VolumeX } from "lucide-react";
import { dark } from "@/lib/tokens";
import { ArticleCard } from "@/components/article-card";

const mono = "'JetBrains Mono', monospace";
const serif = "'Source Serif 4', Georgia, serif";
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

type SourceData = {
  id: string;
  handle: string;
  name: string;
  site_url: string | null;
  created_at: string;
  verification_status: string | null;
};

type TagData = {
  id: string;
  slug: string;
  name: string;
  articleIds: string[];
};

type Props = {
  source: SourceData;
  articles: ArticleData[];
  likedIds: string[];
  bookmarkedIds: string[];
  initialFollowing: boolean;
  initialMuted: boolean;
  isLoggedIn: boolean;
  followerCount: number;
  postCount: number;
  tags: TagData[];
};

const PAGE_SIZE = 20;

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

export function SourceProfileClient({
  source,
  articles: initialArticles,
  likedIds: initialLikedIds,
  bookmarkedIds: initialBookmarkedIds,
  initialFollowing,
  initialMuted,
  isLoggedIn,
  followerCount: initialFollowerCount,
  postCount,
  tags: initialTags,
}: Props) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [muted, setMuted] = useState(initialMuted);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);

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

  const createdYear = new Date(source.created_at).getFullYear();

  // Tag filtering
  const activeTag = activeTagSlug ? tags.find((t) => t.slug === activeTagSlug) : null;
  const displayedArticles = activeTag
    ? articles.filter((a) => activeTag.articleIds.includes(a.id))
    : articles;

  async function handleFollow() {
    if (!isLoggedIn) { router.push("/auth/signin"); return; }
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    setFollowerCount((c) => c + (wasFollowing ? -1 : 1));
    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_id: source.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setFollowing(data.following);
      window.dispatchEvent(new CustomEvent("followChanged"));
    } else {
      setFollowing(wasFollowing);
      setFollowerCount((c) => c + (wasFollowing ? 1 : -1));
    }
  }

  async function handleMute() {
    if (!isLoggedIn) { router.push("/auth/signin"); return; }
    const wasMuted = muted;
    setMuted(!wasMuted);
    const res = await fetch("/api/mute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_id: source.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setMuted(data.muted);
    } else {
      setMuted(wasMuted);
    }
  }

  // Infinite scroll
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/articles?offset=${articles.length}&limit=${PAGE_SIZE}&source_id=${source.id}`
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

      // Rebuild tags
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
  }, [articles, loading, hasMore, postCount, source.id]);

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

  return (
    <div style={{ padding: "32px 36px 80px" }}>
      {/* ─── IDENTITY HEADER ─── */}
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 24 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 6,
            background: handleToColor(source.handle),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: inter,
            fontSize: 24,
            fontWeight: 700,
            color: "#fff",
          }}
        >
          {getInitials(source.name)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
              {source.name}
            </h1>
            <ShieldCheck size={22} style={{ color: dark.accent, flexShrink: 0 }} />
          </div>

          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              color: dark.textMute,
              marginTop: 6,
            }}
          >
            @{source.handle} · {followerCount} follower{followerCount !== 1 ? "s" : ""} · est. {createdYear}
          </div>

          {source.site_url && (
            <a
              href={source.site_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: dark.accent,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 6,
              }}
            >
              <Globe size={12} /> {source.site_url.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>

      {/* ─── ACTION BLOCK ─── */}
      <div
        style={{
          background: dark.surface,
          border: `1px solid ${dark.line}`,
          borderRadius: 6,
          padding: 16,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            color: dark.textMute,
            marginBottom: 12,
          }}
        >
          THIS SOURCE
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={handleFollow}
            className="cursor-pointer"
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 6,
              fontFamily: inter,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.12s",
              background: following ? "transparent" : dark.accent,
              color: following ? dark.accent : "#fff",
              border: following ? `1px solid ${dark.accentLine}` : `1px solid ${dark.accent}`,
            }}
          >
            <UserPlus size={15} />
            {following ? "Following" : "Follow source"}
          </button>

          <button
            onClick={handleMute}
            className="cursor-pointer"
            style={{
              width: "100%",
              padding: "10px 0",
              borderRadius: 6,
              fontFamily: inter,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "all 0.12s",
              background: dark.surface2,
              color: muted ? dark.textMute : dark.textDim,
              border: `1px solid ${dark.line2}`,
            }}
          >
            <VolumeX size={15} />
            {muted ? "Muted" : "Mute notifications"}
          </button>
        </div>

        <div style={{ borderTop: `1px solid ${dark.line}`, marginTop: 14, paddingTop: 12 }}>
          <p
            style={{
              fontFamily: inter,
              fontSize: 12,
              color: dark.textDim,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Following puts this source on your home feed and enables alerts for corrections and breaking posts.
          </p>
        </div>
      </div>

      {/* ─── CATEGORY PILLS + SHOWING COUNT (same pattern as home feed) ─── */}
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
            showing {displayedArticles.length} of {postCount}
          </span>
        </div>
      </div>

      {/* ─── POSTS FEED ─── */}
      {displayedArticles.length === 0 ? (
        <p
          className="text-center py-12"
          style={{ fontFamily: mono, fontSize: 12, color: dark.textMute }}
        >
          {activeTagSlug ? "No articles match this filter." : "No articles from this source yet."}
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
              initialFollowing={following}
              initialMuted={muted}
              sourceId={source.id}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} style={{ minHeight: 1 }} />
      {loading && (
        <p
          className="text-center"
          style={{ fontFamily: mono, fontSize: 11, color: dark.textMute, marginTop: 24 }}
        >
          Loading...
        </p>
      )}
      {!hasMore && displayedArticles.length > 0 && (
        <p
          className="text-center"
          style={{ fontFamily: mono, fontSize: 11, color: dark.textMute, marginTop: 32, marginBottom: 16 }}
        >
          {"// end of posts from this source"}
        </p>
      )}
    </div>
  );
}
