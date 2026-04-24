import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";
import { ArticleCard } from "@/components/article-card";
import Link from "next/link";
import { dark } from "@/lib/tokens";
import { inferTags } from "@/lib/tag-keywords";

export const revalidate = 0;

const mono = "'JetBrains Mono', monospace";

export default async function TagPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { slug } = params;

  // Try fetching the tag from DB
  const { data: tag } = await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  // Fetch articles for this tag from article_tags (if tag exists in DB)
  let articleIds: string[] = [];
  if (tag) {
    const { data: articleTagRows } = await supabase
      .from("article_tags")
      .select("article_id")
      .eq("tag_id", tag.id);
    articleIds = (articleTagRows ?? []).map((r) => r.article_id);
  }

  // Tag display name
  const tagName = tag?.name ?? slug.charAt(0).toUpperCase() + slug.slice(1);

  // If no DB results, try keyword-based matching
  let articles: {
    id: string; title: string; url: string; published_at: string | null;
    description: string | null; image_url: string | null; like_count: number;
    source_id: string; sources: unknown;
  }[] = [];

  if (articleIds.length > 0) {
    const { data } = await supabase
      .from("articles")
      .select("id, title, url, published_at, description, image_url, like_count, source_id, sources:sources(name, handle, logo_url)")
      .in("id", articleIds)
      .eq("is_hidden", false)
      .order("published_at", { ascending: false });
    articles = data ?? [];
  } else {
    // Keyword fallback: fetch recent articles and filter by inferred tag
    const { data } = await supabase
      .from("articles")
      .select("id, title, url, published_at, description, image_url, like_count, source_id, sources:sources(name, handle, logo_url)")
      .eq("is_hidden", false)
      .order("published_at", { ascending: false })
      .limit(200);

    articles = (data ?? []).filter((a) => {
      const inferred = inferTags(a.title, a.description as string | null);
      return inferred.some((t) => t.slug === slug);
    });

    if (articles.length === 0) {
      return (
        <Shell>
          <div className="p-6">
            <p
              className="text-center py-16"
              style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: "#6C727E" }}
            >
              Tag not found
            </p>
          </div>
        </Shell>
      );
    }
  }

  // Enrich with tags (DB + keyword fallback)
  const feedArticles = articles.map((article) => ({
    ...article,
    sources: article.sources as unknown as { name: string; handle: string; logo_url: string | null } | null,
    tags: inferTags(article.title, article.description as string | null),
  }));

  // Collect related tags from these articles
  const relatedTags = new Map<string, { slug: string; name: string; count: number }>();
  for (const article of feedArticles) {
    for (const t of article.tags) {
      if (t.slug === slug) continue;
      const existing = relatedTags.get(t.slug);
      if (existing) existing.count++;
      else relatedTags.set(t.slug, { slug: t.slug, name: t.name, count: 1 });
    }
  }
  const topRelated = Array.from(relatedTags.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Fetch user state
  const { data: { user } } = await supabase.auth.getUser();

  let likedIds = new Set<string>();
  let bookmarkedIds = new Set<string>();
  let followedIds = new Set<string>();
  let mutedIds = new Set<string>();

  if (user) {
    const [likesRes, bookmarksRes, followsRes, mutesRes] = await Promise.all([
      supabase.from("likes").select("article_id").eq("user_id", user.id),
      supabase.from("bookmarks").select("article_id").eq("user_id", user.id),
      supabase.from("follows").select("source_id").eq("user_id", user.id),
      supabase.from("mutes").select("source_id").eq("user_id", user.id),
    ]);
    likedIds = new Set((likesRes.data ?? []).map((r) => r.article_id));
    bookmarkedIds = new Set((bookmarksRes.data ?? []).map((r) => r.article_id));
    followedIds = new Set((followsRes.data ?? []).map((r) => r.source_id));
    mutedIds = new Set((mutesRes.data ?? []).map((r) => r.source_id));
  }

  const count = feedArticles.length;

  return (
    <Shell>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: 24,
              fontWeight: 700,
              color: "#EEF1F6",
            }}
          >
            #{tagName}
          </h1>
          <p style={{ fontFamily: mono, fontSize: 11, color: "#6C727E", marginTop: 4 }}>
            {count} article{count !== 1 ? "s" : ""} · chronological
          </p>
        </div>

        {/* Related tags */}
        {topRelated.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-5">
            {topRelated.map((t) => (
              <Link
                key={t.slug}
                href={`/tag/${t.slug}`}
                className="right-rail-tag"
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: dark.textSub,
                  padding: "3px 7px",
                  borderRadius: 3,
                  border: `1px solid ${dark.line2}`,
                  background: dark.surface,
                  textDecoration: "none",
                  transition: "border-color 0.12s",
                }}
              >
                #{t.name}
              </Link>
            ))}
          </div>
        )}

        {/* Articles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {feedArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              initialLiked={likedIds.has(article.id)}
              initialLikeCount={article.like_count}
              initialBookmarked={bookmarkedIds.has(article.id)}
              initialFollowing={followedIds.has(article.source_id)}
              initialMuted={mutedIds.has(article.source_id)}
              sourceId={article.source_id}
              isLoggedIn={!!user}
            />
          ))}
        </div>

        <p
          className="text-center"
          style={{ fontFamily: mono, fontSize: 11, color: "#6C727E", marginTop: 32, marginBottom: 16 }}
        >
          {"// end of tag results"}
        </p>
      </div>
    </Shell>
  );
}
