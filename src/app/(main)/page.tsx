import { createClient } from "@/lib/supabase/server";
import { Feed } from "@/components/feed";
import { inferTags } from "@/lib/tag-keywords";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();

  const [{ data: articles, error }, { count: totalArticleCount }] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, url, published_at, description, image_url, like_count, source_id, sources:sources(name, handle, logo_url)")
      .eq("is_hidden", false)
      .order("published_at", { ascending: false })
      .range(0, 19),
    supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("is_hidden", false),
  ]);

  if (error) {
    return (
      <p className="text-red-400">Error loading articles: {error.message}</p>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  let likedIds: string[] = [];
  let bookmarkedIds: string[] = [];
  let followedSourceIds: string[] = [];
  let mutedSourceIds: string[] = [];
  let mutedTagIds: string[] = [];

  if (user) {
    const [likesRes, bookmarksRes, followsRes, mutesRes, tagMutesRes] = await Promise.all([
      supabase.from("likes").select("article_id").eq("user_id", user.id),
      supabase.from("bookmarks").select("article_id").eq("user_id", user.id),
      supabase.from("follows").select("source_id").eq("user_id", user.id).not("source_id", "is", null),
      supabase.from("mutes").select("source_id").eq("user_id", user.id).not("source_id", "is", null),
      supabase.from("mutes").select("tag_id").eq("user_id", user.id).not("tag_id", "is", null),
    ]);
    likedIds = (likesRes.data ?? []).map((r) => r.article_id);
    bookmarkedIds = (bookmarksRes.data ?? []).map((r) => r.article_id);
    followedSourceIds = (followsRes.data ?? []).filter((r): r is { source_id: string } => r.source_id != null).map((r) => r.source_id);
    mutedSourceIds = (mutesRes.data ?? []).filter((r): r is { source_id: string } => r.source_id != null).map((r) => r.source_id);
    mutedTagIds = (tagMutesRes.data ?? []).filter((r): r is { tag_id: string } => r.tag_id != null).map((r) => r.tag_id);
  }

  // Fetch all article_tags with tag info (used for both per-article tags and feed filter pills)
  const { data: tagRows } = await supabase
    .from("article_tags")
    .select("article_id, tag_id, tags!inner(id, slug, name:label)");

  // Build article→tags map and tag→articles map in one pass
  const articleTagsMap = new Map<string, { slug: string; name: string }[]>();
  const tagMap = new Map<string, { id: string; slug: string; name: string; articleIds: string[]; count: number }>();
  for (const row of tagRows ?? []) {
    const tag = row.tags as unknown as { id: string; slug: string; name: string };

    // Per-article tags
    const existing = articleTagsMap.get(row.article_id);
    if (existing) {
      existing.push({ slug: tag.slug, name: tag.name });
    } else {
      articleTagsMap.set(row.article_id, [{ slug: tag.slug, name: tag.name }]);
    }

    // Tag filter pills
    const tagEntry = tagMap.get(tag.id);
    if (tagEntry) {
      tagEntry.articleIds.push(row.article_id);
      tagEntry.count++;
    } else {
      tagMap.set(tag.id, { id: tag.id, slug: tag.slug, name: tag.name, articleIds: [row.article_id], count: 1 });
    }
  }

  const feedArticles = (articles ?? []).map((article) => {
    const dbTags = articleTagsMap.get(article.id) ?? [];
    // Fallback: infer tags from title/description if no DB tags
    const tags = dbTags.length > 0 ? dbTags : inferTags(article.title, article.description);
    return {
      ...article,
      sources: article.sources as unknown as { name: string; handle: string; logo_url: string | null } | null,
      tags,
    };
  });

  // Rebuild tag maps from enriched articles (covers both DB and inferred tags)
  const enrichedTagMap = new Map<string, { id: string; slug: string; name: string; articleIds: string[]; count: number }>();
  for (const article of feedArticles) {
    for (const tag of article.tags) {
      const existing = enrichedTagMap.get(tag.slug);
      if (existing) {
        existing.articleIds.push(article.id);
        existing.count++;
      } else {
        enrichedTagMap.set(tag.slug, { id: tag.slug, slug: tag.slug, name: tag.name, articleIds: [article.id], count: 1 });
      }
    }
  }

  // Count articles published today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayArticles = feedArticles.filter(
    (a) => a.published_at && new Date(a.published_at) >= todayStart
  ).length;

  const feedTags = Array.from(enrichedTagMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(({ id, slug, name, articleIds }) => ({ id, slug, name, articleIds }));

  // Resolve muted tag IDs to article IDs for filtering
  let mutedTagArticleIds: string[] = [];
  if (mutedTagIds.length > 0) {
    const { data: mutedTagArticles } = await supabase
      .from("article_tags")
      .select("article_id")
      .in("tag_id", mutedTagIds);
    mutedTagArticleIds = (mutedTagArticles ?? []).map((r) => r.article_id);
  }

  return (
    <Feed
      articles={feedArticles}
      likedIds={likedIds}
      bookmarkedIds={bookmarkedIds}
      followedSourceIds={followedSourceIds}
      mutedSourceIds={mutedSourceIds}
      mutedTagArticleIds={mutedTagArticleIds}
      isLoggedIn={!!user}
      followedSourceCount={followedSourceIds.length}
      todayArticleCount={todayArticles}
      tags={feedTags}
      totalCount={totalArticleCount ?? 0}
    />
  );
}
