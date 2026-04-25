"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThumbsUp, Bookmark, ExternalLink, CheckCircle2, MoreHorizontal } from "lucide-react";
import { dark } from "@/lib/tokens";
import { Spinner } from "@/components/ui/spinner";
import { getSourceLogoUrl } from "@/lib/source-logo";

type Article = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
  like_count: number;
  source_id: string;
  sources: { name: string; handle: string; logo_url: string | null; site_url?: string | null } | null;
  tags?: { slug: string; name: string }[];
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
  const [showImage, setShowImage] = useState(false);
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

  useEffect(() => {
    function onFollowChanged(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.sourceId === sourceId) setFollowing(detail.following);
    }
    function onMuteChanged(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail?.sourceId === sourceId) setMuted(detail.muted);
    }
    window.addEventListener("sourceFollowChanged", onFollowChanged);
    window.addEventListener("sourceMuteChanged", onMuteChanged);
    return () => {
      window.removeEventListener("sourceFollowChanged", onFollowChanged);
      window.removeEventListener("sourceMuteChanged", onMuteChanged);
    };
  }, [sourceId]);

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
        window.dispatchEvent(new CustomEvent("bookmarkChanged"));
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
      window.dispatchEvent(new CustomEvent("followChanged"));
      window.dispatchEvent(new CustomEvent("sourceFollowChanged", { detail: { sourceId, following: data.following } }));
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
      window.dispatchEvent(new CustomEvent("sourceMuteChanged", { detail: { sourceId, muted: data.muted } }));
    } else {
      setMuted(wasMuted);
    }
  }

  return (
    <div
      className="article-card"
      style={{
        background: dark.surface,
        border: `1px solid ${dark.line}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      {/* Row 1 — Source header */}
      <div className="flex items-start gap-3 mb-3">
        <Link href={`/source/${source?.handle ?? "unknown"}`} className="flex-shrink-0" style={{ textDecoration: "none" }}>
          {(() => {
            const logoSrc = getSourceLogoUrl(source?.logo_url, source?.site_url);
            return logoSrc ? (
              <img
                src={logoSrc}
                alt={name}
                style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div
                className="flex items-center justify-center"
                style={{
                  width: 32, height: 32, borderRadius: 6, background: avatarBg,
                  fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: "var(--on-accent)",
                }}
              >
                {initial}
              </div>
            );
          })()}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={`/source/${source?.handle ?? "unknown"}`} className="text-link" style={{ textDecoration: "none", fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 700, color: dark.text }}>
              {name}
            </Link>
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
            className="icon-btn cursor-pointer"
            style={{ background: "none", border: "none", padding: 4, borderRadius: 4, color: dark.textMute }}
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
                className="menu-item w-full text-left cursor-pointer"
                style={{
                  display: "block",
                  background: "none",
                  border: "none",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13,
                  color: dark.text,
                  padding: "8px 12px",
                }}
              >
                {following ? "Unfollow source" : "Follow source"}
              </button>
              <button
                onClick={handleMute}
                className="menu-item w-full text-left cursor-pointer"
                style={{
                  display: "block",
                  background: "none",
                  border: "none",
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 13,
                  color: dark.danger,
                  padding: "8px 12px",
                }}
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
        className="article-title block mb-2 hover:underline"
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

      {/* Row 4 — Image (hidden probe + visible container) */}
      {article.image_url && !showImage && (
        <img
          src={article.image_url}
          alt=""
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth >= 400 && img.naturalHeight >= 200) setShowImage(true);
          }}
          style={{ display: "none" }}
        />
      )}
      {article.image_url && showImage && (
        <div
          className="article-image-container mb-3"
          style={{
            position: "relative",
            overflow: "hidden",
            background: dark.surface,
            borderRadius: 4,
            height: 420,
          }}
        >
          <img
            src={article.image_url}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "blur(24px)",
              transform: "scale(1.1)",
              opacity: 0.5,
            }}
          />
          <img
            src={article.image_url}
            alt=""
            style={{
              position: "relative",
              zIndex: 1,
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      {/* Row 5 — Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {article.tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="right-rail-tag"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: dark.textSub,
                padding: "2px 7px",
                borderRadius: 3,
                border: `1px solid ${dark.line2}`,
                background: dark.surface,
                textDecoration: "none",
                transition: "border-color 0.12s",
              }}
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}

      {/* Divider — full width */}
      <div style={{ margin: "0 -16px", borderTop: `1px solid ${dark.line}` }} />

      {/* Row 6 — Footer */}
      <div
        className="flex items-center gap-4"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: dark.textMute, paddingTop: 10 }}
      >
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center gap-1.5 cursor-pointer ${liked ? "icon-btn-active" : "icon-btn"}`}
          style={{
            background: liked ? dark.accentDim : "none",
            border: liked ? `1px solid ${dark.accentLine}` : "1px solid transparent",
            padding: "4px 10px",
            borderRadius: 6,
            font: "inherit",
            color: liked ? dark.accent : dark.textMute,
            cursor: likeLoading ? "wait" : "pointer",
          }}
        >
          {likeLoading ? <Spinner /> : <ThumbsUp size={14} fill={liked ? dark.accent : "none"} />}
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
          className={`cursor-pointer ${bookmarked ? "icon-btn-active" : "icon-btn"}`}
          style={{
            background: "none", border: "none", padding: 4, borderRadius: 4, font: "inherit",
            color: bookmarked ? dark.accent : dark.textMute,
            cursor: bookmarkLoading ? "wait" : "pointer",
          }}
        >
          {bookmarkLoading ? <Spinner /> : <Bookmark size={14} fill={bookmarked ? dark.accent : "none"} />}
        </button>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link ml-auto flex items-center gap-1"
          style={{ color: dark.textMute }}
        >
          <ExternalLink size={12} /> source
        </a>
      </div>
    </div>
  );
}
