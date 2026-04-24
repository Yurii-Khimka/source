import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";
import { DiscoveryClient } from "./discovery-client";

export const revalidate = 0;

export default async function DiscoveryPage() {
  const supabase = createClient();

  const now = Date.now();
  const yesterday = new Date(now - 86400000).toISOString();
  const twoDaysAgo = new Date(now - 2 * 86400000).toISOString();

  const [
    { data: sources },
    { data: allTags },
    { data: allTagRows },
    { data: tagRows24h },
    { data: tagRows48h },
    { data: userData },
    { data: recentArticles },
  ] = await Promise.all([
    supabase
      .from("sources")
      .select("id, handle, name, site_url, verification_status")
      .eq("is_hidden", false)
      .order("name"),
    // All tags in the DB
    supabase
      .from("tags")
      .select("id, slug, name:label"),
    // All article_tags (total count per tag, no time filter)
    supabase
      .from("article_tags")
      .select("tag_id"),
    // article_tags from last 24h (for trending sort + delta)
    supabase
      .from("article_tags")
      .select("tag_id, articles!inner(published_at)")
      .gte("articles.published_at", yesterday),
    // article_tags from 24h–48h ago (for delta calculation)
    supabase
      .from("article_tags")
      .select("tag_id, articles!inner(published_at)")
      .gte("articles.published_at", twoDaysAgo)
      .lt("articles.published_at", yesterday),
    supabase.auth.getUser(),
    // Recent articles for posts sections
    supabase
      .from("articles")
      .select("id, title, url, published_at, description, image_url, like_count, source_id, sources:sources(name, handle, logo_url)")
      .eq("is_hidden", false)
      .order("published_at", { ascending: false })
      .limit(20),
  ]);

  const user = userData?.user ?? null;

  let followedSourceIds: string[] = [];
  let likedIds: string[] = [];
  let bookmarkedIds: string[] = [];
  let mutedSourceIds: string[] = [];
  const followerCounts: Record<string, number> = {};

  if (user) {
    const [
      { data: follows },
      { data: likes },
      { data: bookmarks },
      { data: mutes },
    ] = await Promise.all([
      supabase.from("follows").select("source_id").eq("user_id", user.id),
      supabase.from("likes").select("article_id").eq("user_id", user.id),
      supabase.from("bookmarks").select("article_id").eq("user_id", user.id),
      supabase.from("muted_sources").select("source_id").eq("user_id", user.id),
    ]);
    followedSourceIds = (follows ?? []).map((f) => f.source_id);
    likedIds = (likes ?? []).map((l) => l.article_id);
    bookmarkedIds = (bookmarks ?? []).map((b) => b.article_id);
    mutedSourceIds = (mutes ?? []).map((m) => m.source_id);
  }

  // Get follower counts for each source
  const { data: allFollows } = await supabase.from("follows").select("source_id");
  for (const f of allFollows ?? []) {
    followerCounts[f.source_id] = (followerCounts[f.source_id] ?? 0) + 1;
  }

  // Build total counts per tag_id (all time)
  const countsTotal = new Map<string, number>();
  for (const row of allTagRows ?? []) {
    countsTotal.set(row.tag_id, (countsTotal.get(row.tag_id) ?? 0) + 1);
  }

  // Build 24h counts per tag_id (for trending sort)
  const counts24h = new Map<string, number>();
  for (const row of tagRows24h ?? []) {
    counts24h.set(row.tag_id, (counts24h.get(row.tag_id) ?? 0) + 1);
  }

  // Build 24h–48h counts per tag_id for delta
  const counts48h = new Map<string, number>();
  for (const row of tagRows48h ?? []) {
    counts48h.set(row.tag_id, (counts48h.get(row.tag_id) ?? 0) + 1);
  }

  let tags: { id: string; slug: string; name: string; count: number; delta: number | null }[];

  if (allTags && allTags.length > 0) {
    tags = allTags
      .map((t) => {
        const count = countsTotal.get(t.id) ?? 0;
        const recent = counts24h.get(t.id) ?? 0;
        const prev = counts48h.get(t.id) ?? 0;
        const delta = prev === 0 ? null : Math.round(((recent - prev) / prev) * 100);
        return { id: t.id, slug: t.slug, name: t.name, count, delta, _recent: recent };
      })
      .sort((a, b) => (b._recent - a._recent) || (b.count - a.count))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map(({ _recent, ...rest }) => rest);
  } else {
    tags = [];
  }

  const sourcesData = (sources ?? []).map((s) => ({
    id: s.id,
    handle: s.handle,
    name: s.name,
    site_url: s.site_url,
    verification_status: s.verification_status,
    followers_count: followerCounts[s.id] ?? 0,
  }));

  // Attach tags to articles
  const articleIds = (recentArticles ?? []).map((a) => a.id);
  let articleTagsMap: Record<string, { slug: string; name: string }[]> = {};
  if (articleIds.length > 0) {
    const { data: atRows } = await supabase
      .from("article_tags")
      .select("article_id, tags:tags(slug, label)")
      .in("article_id", articleIds);
    for (const row of atRows ?? []) {
      const tag = row.tags as unknown as { slug: string; label: string } | null;
      if (!tag) continue;
      if (!articleTagsMap[row.article_id]) articleTagsMap[row.article_id] = [];
      articleTagsMap[row.article_id].push({ slug: tag.slug, name: tag.label });
    }
  }

  const likedSet = new Set(likedIds);
  const bookmarkedSet = new Set(bookmarkedIds);
  const followedSet = new Set(followedSourceIds);
  const mutedSet = new Set(mutedSourceIds);

  const articlesData = (recentArticles ?? []).map((a) => ({
    article: {
      id: a.id,
      title: a.title,
      url: a.url,
      description: a.description,
      image_url: a.image_url,
      published_at: a.published_at,
      like_count: a.like_count,
      source_id: a.source_id,
      sources: a.sources as unknown as { name: string; handle: string; logo_url: string | null } | null,
      tags: articleTagsMap[a.id] ?? [],
    },
    initialLiked: likedSet.has(a.id),
    initialLikeCount: a.like_count,
    initialBookmarked: bookmarkedSet.has(a.id),
    initialFollowing: followedSet.has(a.source_id),
    initialMuted: mutedSet.has(a.source_id),
    sourceId: a.source_id,
  }));

  return (
    <Shell>
      <DiscoveryClient
        sources={sourcesData}
        tags={tags}
        followedSourceIds={followedSourceIds}
        isLoggedIn={!!user}
        articles={articlesData}
      />
    </Shell>
  );
}
