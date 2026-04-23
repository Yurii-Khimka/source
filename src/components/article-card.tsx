import { dark } from "@/lib/tokens";

type Article = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
  sources: { name: string; handle: string } | null;
};

export function ArticleCard({ article }: { article: Article }) {
  const source = article.sources;
  const timeStr = article.published_at
    ? new Date(article.published_at)
        .toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(",", " ·")
    : "—";

  return (
    <div
      style={{
        background: dark.surface,
        border: `1px solid ${dark.line}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      {/* Row 1 — source + time */}
      <div className="flex items-center gap-2 mb-2">
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            color: dark.text,
          }}
        >
          {source?.name ?? "Unknown"}
        </span>
        <span style={{ color: dark.accent, fontSize: 12 }}>✓</span>
        <span
          className="ml-auto"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: dark.textMute,
          }}
        >
          {timeStr}
        </span>
      </div>

      {/* Row 2 — title */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block mb-2 hover:underline"
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 20,
          fontWeight: 700,
          color: dark.text,
          lineHeight: 1.3,
        }}
      >
        {article.title}
      </a>

      {/* Row 3 — description */}
      {article.description && (
        <p
          className="line-clamp-2 mb-3"
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13.5,
            color: dark.textSub,
            lineHeight: 1.5,
          }}
        >
          {article.description}
        </p>
      )}

      {/* Row 4 — image */}
      {article.image_url && (
        <img
          src={article.image_url}
          alt=""
          className="w-full mb-3"
          style={{
            maxHeight: 220,
            objectFit: "cover",
            borderRadius: 6,
          }}
        />
      )}

      {/* Row 5 — footer */}
      <div
        className="flex items-center gap-4"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: dark.textMute,
        }}
      >
        <span className="flex items-center gap-1">
          <span style={{ fontSize: 13 }}>♥</span> 0
        </span>
        <span style={{ fontSize: 13 }}>⊞</span>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto hover:underline"
          style={{ color: dark.textMute }}
        >
          Read original →
        </a>
      </div>
    </div>
  );
}
