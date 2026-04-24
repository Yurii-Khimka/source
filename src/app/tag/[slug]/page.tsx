import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";
import { ArticleCard } from "@/components/article-card";
import Link from "next/link";
import { dark } from "@/lib/tokens";

export const revalidate = 0;

const mono = "'JetBrains Mono', monospace";

export default async function TagPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { slug } = params;

  // Fetch the tag
  const { data: tag } = await supabase
    .from("tags")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (!tag) {
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

  // Fetch article IDs for this tag
  const { data: articleTagRows } = await supabase
    .from("article_tags")
    .select("article_id")
    .eq("tag_id", tag.id);

  const articleIds = (articleTagRows ?? []).map((r) => r.article_id);

  if (articleIds.length === 0) {
    return (
      <Shell>
        <div className="p-6">
          <div className="mb-6">
            <h1
              style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: 24,
                fontWeight: 700,
                color: "#EEF1F6",
              }}
            >
              #{tag.name}
            </h1>
            <p style={{ fontFamily: mono, fontSize: 11, color: "#6C727E", marginTop: 4 }}>
              0 articles
            </p>
          </div>
          <p
            className="text-center py-12"
            style={{ fontFamily: mono, fontSize: 11, color: "#6C727E" }}
          >
            {"// no articles with this tag yet"}
          </p>
        </div>
      </Shell>
    );
  }

  // Fetch articles
  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, url, published_at, description, image_url, like_count, source_id, sources:sources(name, handle, logo_url)")
    .in("id", articleIds)
    .eq("is_hidden", false)
    .order("published_at", { ascending: false });

  // Fetch all tags for these articles
  const { data: allTagRows } = await supabase
    .from("article_tags")
    .select("article_id, tags!inner(slug, name)")
    .in("article_id", articleIds);

  const articleTagsMap = new Map<string, { slug: string; name: string }[]>();
  for (const row of allTagRows ?? []) {
    const t = row.tags as unknown as { slug: string; name: string };
    const existing = articleTagsMap.get(row.article_id);
    if (existing) {
      existing.push({ slug: t.slug, name: t.name });
    } else {
      articleTagsMap.set(row.article_id, [{ slug: t.slug, name: t.name }]);
    }
  }

  const feedArticles = (articles ?? []).map((article) => ({
    ...article,
    sources: article.sources as unknown as { name: string; handle: string; logo_url: string | null } | null,
    tags: articleTagsMap.get(article.id) ?? [],
  }));

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

  // Fetch related tags (other tags on these articles)
  const relatedTags = new Map<string, { slug: string; name: string; count: number }>();
  for (const row of allTagRows ?? []) {
    const t = row.tags as unknown as { slug: string; name: string };
    if (t.slug === slug) continue;
    const existing = relatedTags.get(t.slug);
    if (existing) {
      existing.count++;
    } else {
      relatedTags.set(t.slug, { slug: t.slug, name: t.name, count: 1 });
    }
  }
  const topRelated = Array.from(relatedTags.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

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
            #{tag.name}
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
