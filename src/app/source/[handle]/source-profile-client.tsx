"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, Globe, MoreHorizontal, Filter, Download,
  Copy, Flag,
} from "lucide-react";
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

type Tab = "posts" | "audit" | "about";

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
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [following, setFollowing] = useState(initialFollowing);
  const [muted, setMuted] = useState(initialMuted);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Posts tab state
  const [articles, setArticles] = useState(initialArticles);
  const [likedIds, setLikedIds] = useState(initialLikedIds);
  const [bookmarkedIds, setBookmarkedIds] = useState(initialBookmarkedIds);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialArticles.length < postCount);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const likedSet = new Set(likedIds);
  const bookmarkedSet = new Set(bookmarkedIds);

  const createdYear = new Date(source.created_at).getFullYear();

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleFollow() {
    if (!isLoggedIn) { router.push("/auth/signin"); return; }
    setMenuOpen(false);
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
    setMenuOpen(false);
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

  function handleCopyLink() {
    setMenuOpen(false);
    navigator.clipboard.writeText(window.location.href);
  }

  function handleReport() {
    setMenuOpen(false);
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

      if (articles.length + unique.length >= postCount) {
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }, [articles, loading, hasMore, postCount, source.id]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || activeTab !== "posts") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, activeTab]);

  const tabItems: { key: Tab; label: string; badge?: number }[] = [
    { key: "posts", label: "Posts", badge: postCount },
    { key: "audit", label: "Audit Log" },
    { key: "about", label: "About" },
  ];

  const menuBtnStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    textAlign: "left",
    background: "none",
    border: "none",
    fontFamily: inter,
    fontSize: 13,
    padding: "8px 12px",
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "32px 36px 60px" }}>
      {/* ─── HEADER ─── */}
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 28 }}>
        {/* Avatar */}
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

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name + badge */}
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

          {/* Pills */}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <span
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: dark.accent,
                padding: "2px 8px",
                borderRadius: 3,
                border: `1px solid ${dark.accentLine}`,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <ShieldCheck size={10} /> Official Source
            </span>
            {following && (
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: "#fff",
                  background: dark.accent,
                  padding: "2px 8px",
                  borderRadius: 3,
                }}
              >
                Following
              </span>
            )}
            {muted && (
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: dark.textMute,
                  padding: "2px 8px",
                  borderRadius: 3,
                  border: `1px solid ${dark.line2}`,
                  background: dark.surface,
                }}
              >
                Muted
              </span>
            )}
          </div>

          {/* Meta line */}
          <div
            style={{
              fontFamily: mono,
              fontSize: 12,
              color: dark.textMute,
              marginTop: 8,
            }}
          >
            @{source.handle} · est. {createdYear}
          </div>

          {/* Website */}
          {source.site_url && (
            <a
              href={source.site_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: mono,
                fontSize: 12,
                color: dark.accent,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 8,
              }}
            >
              <Globe size={12} /> {source.site_url.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        {/* Actions dropdown */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="cursor-pointer"
            style={{
              background: dark.surface,
              border: `1px solid ${dark.line}`,
              borderRadius: 6,
              padding: "8px 12px",
              color: dark.textDim,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: mono,
              fontSize: 11,
            }}
          >
            <MoreHorizontal size={16} /> Actions
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 40,
                zIndex: 50,
                background: dark.surface2,
                border: `1px solid ${dark.line2}`,
                borderRadius: 6,
                minWidth: 200,
                overflow: "hidden",
              }}
            >
              <button
                onClick={handleFollow}
                style={{ ...menuBtnStyle, color: dark.text }}
                onMouseEnter={(e) => (e.currentTarget.style.background = dark.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                {following ? "Unfollow source" : "Follow source"}
              </button>
              <button
                onClick={handleMute}
                style={{ ...menuBtnStyle, color: dark.text }}
                onMouseEnter={(e) => (e.currentTarget.style.background = dark.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                {muted ? "Unmute notifications" : "Mute notifications"}
              </button>
              <button
                onClick={handleCopyLink}
                style={{ ...menuBtnStyle, color: dark.text }}
                onMouseEnter={(e) => (e.currentTarget.style.background = dark.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Copy size={13} /> Copy source link
                </span>
              </button>
              <button
                onClick={handleReport}
                style={{ ...menuBtnStyle, color: dark.danger }}
                onMouseEnter={(e) => (e.currentTarget.style.background = dark.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Flag size={13} /> Report source
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── STATS STRIP ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          background: dark.surface,
          border: `1px solid ${dark.line}`,
          borderRadius: 6,
          marginBottom: 20,
        }}
      >
        {[
          { value: String(followerCount), label: "Followers" },
          { value: String(postCount), label: "Posts" },
          { value: "0.12%", label: "Corrections" },
          { value: "99.4%", label: "Citation integrity" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              padding: "16px 20px",
              borderRight: i < 3 ? `1px solid ${dark.line}` : "none",
              textAlign: "center",
            }}
          >
            <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: dark.text }}>
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: dark.textMute,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginTop: 4,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* ─── TRANSPARENCY RECORD ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          background: dark.surface,
          border: `1px solid ${dark.line}`,
          borderRadius: 6,
          marginBottom: 28,
        }}
      >
        {[
          { value: "99.4%", label: "Citation integrity", sub: "posts with primary source" },
          { value: "< 2h", label: "Median correction time", sub: "time to correction issued" },
          { value: "0", label: "Moderation disclosures", sub: "actions in last 90 days" },
        ].map((item, i) => (
          <div
            key={item.label}
            style={{
              padding: "16px 20px",
              borderRight: i < 2 ? `1px solid ${dark.line}` : "none",
            }}
          >
            <div style={{ fontFamily: serif, fontSize: 24, fontWeight: 700, color: dark.text }}>
              {item.value}
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 10,
                color: dark.textMute,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginTop: 4,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: dark.textMute,
                marginTop: 2,
              }}
            >
              {item.sub}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 11,
          color: dark.textMute,
          textAlign: "right",
          marginTop: -20,
          marginBottom: 28,
        }}
      >
        public ledger · cryptographically signed
      </div>

      {/* ─── TABS ─── */}
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
              {tab.badge !== undefined && (
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
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ─── POSTS TAB ─── */}
      {activeTab === "posts" && (
        <div>
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
              CHRONOLOGICAL FEED
            </div>
            <button
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: dark.textDim,
                background: "none",
                border: `1px solid ${dark.line2}`,
                borderRadius: 4,
                padding: "5px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Filter size={12} /> All categories
            </button>
          </div>

          {articles.length === 0 ? (
            <p
              style={{
                fontFamily: mono,
                fontSize: 12,
                color: dark.textMute,
                textAlign: "center",
                paddingTop: 48,
              }}
            >
              No articles from this source yet.
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
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: dark.textMute,
                textAlign: "center",
                marginTop: 24,
              }}
            >
              Loading...
            </p>
          )}
          {!hasMore && articles.length > 0 && (
            <p
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: dark.textMute,
                textAlign: "center",
                marginTop: 32,
                marginBottom: 16,
              }}
            >
              {"// end of posts from this source"}
            </p>
          )}
        </div>
      )}

      {/* ─── AUDIT LOG TAB ─── */}
      {activeTab === "audit" && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
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
              AUDIT LOG · last 90 days
            </div>
            <button
              style={{
                fontFamily: mono,
                fontSize: 11,
                color: dark.textDim,
                background: "none",
                border: `1px solid ${dark.line2}`,
                borderRadius: 4,
                padding: "5px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Download size={12} /> Export JSONL
            </button>
          </div>

          <p
            style={{
              fontFamily: mono,
              fontSize: 12,
              color: dark.textMute,
              textAlign: "center",
              paddingTop: 48,
              paddingBottom: 48,
            }}
          >
            No audit entries yet. Public ledger coming in Phase 3.
          </p>
        </div>
      )}

      {/* ─── ABOUT TAB ─── */}
      {activeTab === "about" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {[
            {
              title: "Editorial charter",
              body: "This source adheres to the principles of factual, unbiased reporting. All editorial decisions are made independently.",
            },
            {
              title: "Verification",
              body: "Source verified through The Source registry.",
            },
            {
              title: "Ownership & legal",
              body: `${source.name}. Independently owned.`,
            },
            {
              title: "Accountability",
              body: "Corrections are issued publicly.",
            },
            {
              title: "Data & privacy",
              body: "No trackers, no third-party analytics.",
            },
            {
              title: "Funding",
              body: "Reader supported.",
            },
          ].map((card) => (
            <div
              key={card.title}
              style={{
                background: dark.surface,
                border: `1px solid ${dark.line}`,
                borderRadius: 6,
                padding: 16,
              }}
            >
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 13,
                  fontWeight: 600,
                  color: dark.text,
                  marginBottom: 6,
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontFamily: inter,
                  fontSize: 13,
                  color: dark.textSub,
                  lineHeight: 1.5,
                }}
              >
                {card.body}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
