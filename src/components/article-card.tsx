"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, Bookmark, ExternalLink, CheckCircle2, MoreHorizontal } from "lucide-react";
import { dark } from "@/lib/tokens";

type Article = {
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
  article: Article;
  initialLiked: boolean;
  initialLikeCount: number;
  initialBookmarked: boolean;
  initialFollowing: boolean;
  initialMuted: boolean;
  sourceId: string;
  isLoggedIn: boolean;
};

const avatarColors: Record<string, string> = {
  B: "#3d5a80",
  D: "#e0b14f",
  E: "#ee6c4d",
  G: "#5b8fb9",
  R: "#9c6ade",
  S: "#44bd8f",
  T: "#cf6a87",
  U: "#3d5a80",
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.max(0, now - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ArticleCard({
  article,
  initialLiked,
  initialLikeCount,
  initialBookmarked,
  initialFollowing,
  initialMuted,
  sourceId,
  isLoggedIn,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [following, setFollowing] = useState(initialFollowing);
  const [muted, setMuted] = useState(initialMuted);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const source = article.sources;
  const name = source?.name ?? "Unknown";
  const initial = name.charAt(0).toUpperCase();
  const avatarBg = avatarColors[initial] ?? "#6C727E";
  const timeAgo = article.published_at ? relativeTime(article.published_at) : "—";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  async function handleLike() {
    if (!isLoggedIn) { router.push("/auth/signin"); return; }
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: article.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.like_count);
      }
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleBookmark() {
    if (!isLoggedIn) { router.push("/auth/signin"); return; }
    if (bookmarkLoading) return;
    setBookmarkLoading(true);
    try {
      const res = await fetch("/api/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: article.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarked(data.bookmarked);
      }
    } finally {
      setBookmarkLoading(false);
    }
  }

  async function handleFollow() {
    if (!isLoggedIn) { router.push("/auth/signin"); return; }
    setMenuOpen(false);
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_id: sourceId }),
    });
    if (res.ok) {
      const data = await res.json();
      setFollowing(data.following);
    } else {
      setFollowing(wasFollowing);
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
      body: JSON.stringify({ source_id: sourceId }),
    });
    if (res.ok) {
      const data = await res.json();
      setMuted(data.muted);
    } else {
      setMuted(wasMuted);
    }
  }

  return (
    <div
      style={{
        background: dark.surface,
        border: `1px solid ${dark.line}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      {/* Row 1 — Source header */}
      <div className="flex items-start gap-3 mb-3">
        {source?.logo_url ? (
          <img
            src={source.logo_url}
            alt={name}
            className="flex-shrink-0"
            style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }}
          />
        ) : (
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 32, height: 32, borderRadius: 6, background: avatarBg,
              fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: "#fff",
            }}
          >
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: dark.text }}>
              {name}
            </span>
            <CheckCircle2 size={12} style={{ color: dark.accent, flexShrink: 0 }} />
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: dark.textMute }}>
            @{source?.handle ?? "unknown"} · {timeAgo}
          </div>
        </div>

        {/* Source menu */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="cursor-pointer"
            style={{ background: "none", border: "none", padding: 4, color: dark.textMute }}
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 28,
                zIndex: 50,
                background: dark.surface2,
                border: `1px solid ${dark.line2}`,
                borderRadius: 6,
                minWidth: 180,
                overflow: "hidden",
              }}
            >
              <button
                onClick={handleFollow}
                className="w-full text-left cursor-pointer"
                style={{
                  display: "block",
                  background: "none",
                  border: "none",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13,
                  color: dark.text,
                  padding: "8px 12px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = dark.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                {following ? "Unfollow source" : "Follow source"}
              </button>
              <button
                onClick={handleMute}
                className="w-full text-left cursor-pointer"
                style={{
                  display: "block",
                  background: "none",
                  border: "none",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13,
                  color: dark.danger,
                  padding: "8px 12px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = dark.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                {muted ? "Unmute source" : "Mute source"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Row 2 — Title */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-2 hover:underline"
        style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 700, color: dark.text, lineHeight: 1.22 }}
      >
        {article.title}
      </a>

      {/* Row 3 — Description */}
      {article.description && (
        <p
          className="line-clamp-3 mb-3"
          style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13.5, color: dark.textSub, lineHeight: 1.55 }}
        >
          {article.description}
        </p>
      )}

      {/* Row 4 — Image */}
      {article.image_url && (
        <img
          src={article.image_url}
          alt=""
          className="w-full mb-3"
          style={{ height: 220, objectFit: "cover", borderRadius: 6, border: `1px solid ${dark.line}` }}
        />
      )}

      {/* Row 5 — Footer */}
      <div
        className="flex items-center gap-4"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: dark.textMute, borderTop: `1px solid ${dark.line}`, paddingTop: 10 }}
      >
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className="flex items-center gap-1.5 cursor-pointer"
          style={{
            background: liked ? "rgba(100,104,240,0.12)" : "none",
            border: liked ? "1px solid rgba(100,104,240,0.42)" : "1px solid transparent",
            padding: "4px 10px",
            borderRadius: 6,
            font: "inherit",
            color: liked ? dark.accent : dark.textMute,
            opacity: likeLoading ? 0.5 : 1,
            cursor: likeLoading ? "wait" : "pointer",
          }}
        >
          <ThumbsUp size={14} fill={liked ? dark.accent : "none"} />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              color: liked ? dark.accent : dark.textMute,
            }}
          >
            {likeCount}
          </span>
        </button>
        <button
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className="cursor-pointer"
          style={{
            background: "none", border: "none", padding: 0, font: "inherit",
            color: bookmarked ? dark.accent : dark.textMute,
            opacity: bookmarkLoading ? 0.5 : 1,
            cursor: bookmarkLoading ? "wait" : "pointer",
          }}
        >
          <Bookmark size={14} fill={bookmarked ? dark.accent : "none"} />
        </button>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto hover:underline flex items-center gap-1"
          style={{ color: dark.textMute }}
        >
          <ExternalLink size={12} /> source
        </a>
      </div>
    </div>
  );
}
