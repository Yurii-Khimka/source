import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { dark } from "@/lib/tokens";
import { inferTags } from "@/lib/tag-keywords";

const inter = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const sectionTitle: React.CSSProperties = {
  fontFamily: mono,
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  color: dark.textMute,
  marginBottom: 10,
};

async function getRecentTags(supabase: ReturnType<typeof createClient>) {
  const yesterday = new Date(Date.now() - 86400000).toISOString();

  // Try tags from article_tags (24h, then all)
  const { data: recentTagRows } = await supabase
    .from("article_tags")
    .select("tag_id, tags!inner(slug, name:label), articles!inner(published_at)")
    .gte("articles.published_at", yesterday);

  if (recentTagRows && recentTagRows.length > 0) {
    const counts = new Map<string, { slug: string; name: string; count: number }>();
    for (const row of recentTagRows) {
      const tag = row.tags as unknown as { slug: string; name: string };
      const existing = counts.get(tag.slug);
      if (existing) existing.count++;
      else counts.set(tag.slug, { slug: tag.slug, name: tag.name, count: 1 });
    }
    return Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 9);
  }

  const { data: allTagRows } = await supabase
    .from("article_tags")
    .select("tag_id, tags!inner(slug, name:label)");

  if (allTagRows && allTagRows.length > 0) {
    const counts = new Map<string, { slug: string; name: string; count: number }>();
    for (const row of allTagRows) {
      const tag = row.tags as unknown as { slug: string; name: string };
      const existing = counts.get(tag.slug);
      if (existing) existing.count++;
      else counts.set(tag.slug, { slug: tag.slug, name: tag.name, count: 1 });
    }
    return Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 9);
  }

  // Fallback: infer tags from recent articles via keyword matching
  const { data: recentArticles } = await supabase
    .from("articles")
    .select("title, description")
    .eq("is_hidden", false)
    .order("published_at", { ascending: false })
    .limit(100);

  if (!recentArticles || recentArticles.length === 0) return [];

  const counts = new Map<string, { slug: string; name: string; count: number }>();
  for (const article of recentArticles) {
    const tags = inferTags(article.title, article.description);
    for (const tag of tags) {
      const existing = counts.get(tag.slug);
      if (existing) existing.count++;
      else counts.set(tag.slug, { slug: tag.slug, name: tag.name, count: 1 });
    }
  }
  return Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 8);
}

export async function RightRail() {
  const supabase = createClient();

  const [
    { count: totalSources },
    { count: totalArticles },
    { count: recentUsers },
    { data: trendingSources },
    recentTags,
  ] = await Promise.all([
    supabase
      .from("sources")
      .select("*", { count: "exact", head: true })
      .eq("is_hidden", false),
    supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("is_hidden", false),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    supabase
      .from("sources")
      .select("id, handle, name")
      .eq("is_hidden", false)
      .order("name")
      .limit(5),
    getRecentTags(supabase),
  ]);

  const stats = [
    { label: "Active users (24h)", value: recentUsers ?? 0 },
    { label: "Total sources", value: totalSources ?? 0 },
    { label: "Total articles", value: totalArticles ?? 0 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Widget 1 — Integrity · Live */}
      <div
        style={{
          background: dark.surface,
          border: `1px solid ${dark.line}`,
          borderRadius: 8,
          padding: 14,
        }}
      >
        <div style={sectionTitle}>Integrity · Live</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontFamily: inter, fontSize: 12, color: dark.textDim }}>
                {s.label}
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  fontWeight: 700,
                  color: dark.text,
                }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Widget 2 — Trending sources */}
      <div>
        <div style={sectionTitle}>Trending sources</div>
        <div className="space-y-0.5">
          {trendingSources?.map((source) => (
            <Link
              key={source.id}
              href={`/source/${source.handle}`}
              className="sidebar-nav-item block truncate"
              style={{
                fontFamily: inter,
                fontSize: 13,
                color: dark.textSub,
                padding: "6px 8px",
                borderRadius: 4,
                textDecoration: "none",
                transition: "background 0.12s",
              }}
            >
              <span style={{ color: dark.textDim }}>@</span>
              {source.handle}
            </Link>
          ))}
        </div>
      </div>

      {/* Widget 3 — Recent hashtags */}
      {recentTags.length > 0 && (
        <div>
          <div style={sectionTitle}>Recent hashtags</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {recentTags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className="right-rail-tag"
                style={{
                  fontFamily: mono,
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
                #{tag.slug}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${dark.line}`,
          paddingTop: 14,
          marginTop: "auto",
          fontFamily: mono,
          fontSize: 10,
          color: dark.textMute,
          lineHeight: 1.8,
        }}
      >
        <div>Feedback · Privacy · Terms</div>
        <div>GitHub</div>
        <div>© 2026 The Source</div>
      </div>
    </div>
  );
}
