import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";
import { ArticleCard } from "@/components/article-card";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, url, published_at, description, image_url, like_count, sources:sources(name, handle, logo_url)")
    .order("published_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <Shell>
        <p className="text-red-400">Error loading articles: {error.message}</p>
      </Shell>
    );
  }

  const count = articles?.length ?? 0;

  return (
    <Shell>
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
          chronological · no algorithm · {count} articles today
        </p>
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-6 mb-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14,
            color: "#EEF1F6",
            paddingBottom: 10,
            borderBottom: "2px solid rgb(100,104,240)",
            cursor: "pointer",
          }}
        >
          All sources
        </span>
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14,
            color: "#6C727E",
            paddingBottom: 10,
            cursor: "default",
          }}
          title="Sign in to follow sources"
        >
          Following
        </span>
      </div>

      {/* Article list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {articles?.map((article) => (
          <ArticleCard
            key={article.id}
            article={{
              ...article,
              sources: article.sources as unknown as { name: string; handle: string; logo_url: string | null } | null,
            }}
          />
        ))}
      </div>

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
        {"// caught up · SORCE never serves you posts out of order"}
      </p>
    </Shell>
  );
}
