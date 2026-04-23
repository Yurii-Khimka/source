"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, Bookmark, ExternalLink, CheckCircle2 } from "lucide-react";
import { dark } from "@/lib/tokens";

type Article = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
  like_count: number;
  sources: { name: string; handle: string; logo_url: string | null } | null;
};

type Props = {
  article: Article;
  initialLiked: boolean;
  initialLikeCount: number;
  initialBookmarked: boolean;
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

export function ArticleCard({ article, initialLiked, initialLikeCount, initialBookmarked, isLoggedIn }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const router = useRouter();

  const source = article.sources;
  const name = source?.name ?? "Unknown";
  const initial = name.charAt(0).toUpperCase();
  const avatarBg = avatarColors[initial] ?? "#6C727E";
  const timeAgo = article.published_at ? relativeTime(article.published_at) : "—";

  async function handleLike() {
    if (!isLoggedIn) {
      router.push("/auth/signin");
      return;
    }
    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => wasLiked ? c - 1 : c + 1);

    const res = await fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: article.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikeCount(data.like_count);
    } else {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount((c) => wasLiked ? c + 1 : c - 1);
    }
  }

  async function handleBookmark() {
    if (!isLoggedIn) {
      router.push("/auth/signin");
      return;
    }
    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);

    const res = await fetch("/api/bookmark", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: article.id }),
    });
    if (res.ok) {
      const data = await res.json();
      setBookmarked(data.bookmarked);
    } else {
      setBookmarked(wasBookmarked);
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
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: avatarBg,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {initial}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: dark.text,
              }}
            >
              {name}
            </span>
            <CheckCircle2 size={12} style={{ color: dark.accent, flexShrink: 0 }} />
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: dark.textMute,
            }}
          >
            @{source?.handle ?? "unknown"} · {timeAgo}
          </div>
        </div>
      </div>

      {/* Row 2 — Title */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-2 hover:underline"
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 22,
          fontWeight: 700,
          color: dark.text,
          lineHeight: 1.22,
        }}
      >
        {article.title}
      </a>

      {/* Row 3 — Description */}
      {article.description && (
        <p
          className="line-clamp-3 mb-3"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13.5,
            color: dark.textSub,
            lineHeight: 1.55,
          }}
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
          style={{
            height: 220,
            objectFit: "cover",
            borderRadius: 6,
            border: `1px solid ${dark.line}`,
          }}
        />
      )}

      {/* Row 5 — Footer */}
      <div
        className="flex items-center gap-4"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: dark.textMute,
          borderTop: `1px solid ${dark.line}`,
          paddingTop: 10,
        }}
      >
        <button
          onClick={handleLike}
          className="flex items-center gap-1 cursor-pointer"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            color: liked ? dark.accent : dark.textMute,
          }}
        >
          <ThumbsUp size={14} fill={liked ? dark.accent : "none"} /> {likeCount}
        </button>
        <button
          onClick={handleBookmark}
          className="cursor-pointer"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            color: bookmarked ? dark.accent : dark.textMute,
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
