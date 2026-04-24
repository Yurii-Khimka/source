import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";
import { Feed } from "@/components/feed";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, url, published_at, description, image_url, like_count, source_id, sources:sources(name, handle, logo_url)")
    .order("published_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <Shell>
        <p className="text-red-400">Error loading articles: {error.message}</p>
      </Shell>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  let likedIds: string[] = [];
  let bookmarkedIds: string[] = [];
  let followedSourceIds: string[] = [];
  let mutedSourceIds: string[] = [];

  if (user) {
    const [likesRes, bookmarksRes, followsRes, mutesRes] = await Promise.all([
      supabase.from("likes").select("article_id").eq("user_id", user.id),
      supabase.from("bookmarks").select("article_id").eq("user_id", user.id),
      supabase.from("follows").select("source_id").eq("user_id", user.id),
      supabase.from("mutes").select("source_id").eq("user_id", user.id),
    ]);
    likedIds = (likesRes.data ?? []).map((r) => r.article_id);
    bookmarkedIds = (bookmarksRes.data ?? []).map((r) => r.article_id);
    followedSourceIds = (followsRes.data ?? []).map((r) => r.source_id);
    mutedSourceIds = (mutesRes.data ?? []).map((r) => r.source_id);
  }

  // Fetch all article_tags with tag info (used for both per-article tags and feed filter pills)
  const { data: tagRows } = await supabase
    .from("article_tags")
    .select("article_id, tag_id, tags!inner(id, slug, name)");

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

  const feedArticles = (articles ?? []).map((article) => ({
    ...article,
    sources: article.sources as unknown as { name: string; handle: string; logo_url: string | null } | null,
    tags: articleTagsMap.get(article.id) ?? [],
  }));

  // Count articles published today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayArticles = feedArticles.filter(
    (a) => a.published_at && new Date(a.published_at) >= todayStart
  ).length;

  const feedTags = Array.from(tagMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(({ id, slug, name, articleIds }) => ({ id, slug, name, articleIds }));

  return (
    <Shell>
      <Feed
        articles={feedArticles}
        likedIds={likedIds}
        bookmarkedIds={bookmarkedIds}
        followedSourceIds={followedSourceIds}
        mutedSourceIds={mutedSourceIds}
        isLoggedIn={!!user}
        followedSourceCount={followedSourceIds.length}
        todayArticleCount={todayArticles}
        tags={feedTags}
      />
    </Shell>
  );
}
