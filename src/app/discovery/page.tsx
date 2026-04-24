import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";
import { DiscoveryClient } from "./discovery-client";
import { inferTags } from "@/lib/tag-keywords";

export const revalidate = 0;

export default async function DiscoveryPage() {
  const supabase = createClient();

  const now = Date.now();
  const yesterday = new Date(now - 86400000).toISOString();
  const twoDaysAgo = new Date(now - 2 * 86400000).toISOString();

  const [
    { data: sources },
    { data: allTags },
    { data: tagRows24h },
    { data: tagRows48h },
    { data: topArticles },
    { data: userData },
  ] = await Promise.all([
    supabase
      .from("sources")
      .select("id, handle, name, site_url, verification_status")
      .eq("is_hidden", false)
      .order("name"),
    // All tags in the DB
    supabase
      .from("tags")
      .select("id, slug, name"),
    // article_tags from last 24h
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
    // Top stories in last 24h by like_count
    supabase
      .from("articles")
      .select("id, title, url, published_at, description, image_url, like_count, source_id, sources:sources(name, handle, logo_url)")
      .eq("is_hidden", false)
      .gte("published_at", yesterday)
      .order("like_count", { ascending: false })
      .limit(20),
    supabase.auth.getUser(),
  ]);

  const user = userData?.user ?? null;

  let followedSourceIds: string[] = [];
  let likedIds: string[] = [];
  let bookmarkedIds: string[] = [];
  let mutedSourceIds: string[] = [];
  const followerCounts: Record<string, number> = {};

  if (user) {
    const [followsRes, likesRes, bookmarksRes, mutesRes] = await Promise.all([
      supabase.from("follows").select("source_id").eq("user_id", user.id),
      supabase.from("likes").select("article_id").eq("user_id", user.id),
      supabase.from("bookmarks").select("article_id").eq("user_id", user.id),
      supabase.from("mutes").select("source_id").eq("user_id", user.id),
    ]);
    followedSourceIds = (followsRes.data ?? []).map((f) => f.source_id);
    likedIds = (likesRes.data ?? []).map((r) => r.article_id);
    bookmarkedIds = (bookmarksRes.data ?? []).map((r) => r.article_id);
    mutedSourceIds = (mutesRes.data ?? []).map((r) => r.source_id);
  }

  // Get follower counts for each source
  const { data: allFollows } = await supabase.from("follows").select("source_id");
  for (const f of allFollows ?? []) {
    followerCounts[f.source_id] = (followerCounts[f.source_id] ?? 0) + 1;
  }

  // Build 24h counts per tag_id
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
    // Use all DB tags, attach counts (even if 0)
    tags = allTags
      .map((t) => {
        const count = counts24h.get(t.id) ?? 0;
        const prev = counts48h.get(t.id) ?? 0;
        const delta = prev === 0 ? null : Math.round(((count - prev) / prev) * 100);
        return { id: t.id, slug: t.slug, name: t.name, count, delta };
      })
      .sort((a, b) => b.count - a.count);
  } else {
    // Fallback: infer tags from recent articles via keyword matching
    const { data: recentArticles } = await supabase
      .from("articles")
      .select("title, description")
      .eq("is_hidden", false)
      .order("published_at", { ascending: false })
      .limit(100);

    const inferred = new Map<string, { slug: string; name: string; count: number }>();
    for (const article of recentArticles ?? []) {
      for (const tag of inferTags(article.title, article.description)) {
        const existing = inferred.get(tag.slug);
        if (existing) existing.count++;
        else inferred.set(tag.slug, { slug: tag.slug, name: tag.name, count: 1 });
      }
    }
    tags = Array.from(inferred.values())
      .sort((a, b) => b.count - a.count)
      .map((t) => ({ id: t.slug, ...t, delta: null }));
  }

  const sourcesData = (sources ?? []).map((s) => ({
    id: s.id,
    handle: s.handle,
    name: s.name,
    site_url: s.site_url,
    verification_status: s.verification_status,
    followers_count: followerCounts[s.id] ?? 0,
  }));

  // Build article_tags map for top articles
  const articleIds = (topArticles ?? []).map((a) => a.id);
  const articleTagsMap = new Map<string, { slug: string; name: string }[]>();
  if (articleIds.length > 0) {
    const { data: articleTagRows } = await supabase
      .from("article_tags")
      .select("article_id, tags!inner(slug, name)")
      .in("article_id", articleIds);
    for (const row of articleTagRows ?? []) {
      const tag = row.tags as unknown as { slug: string; name: string };
      const existing = articleTagsMap.get(row.article_id);
      if (existing) existing.push({ slug: tag.slug, name: tag.name });
      else articleTagsMap.set(row.article_id, [{ slug: tag.slug, name: tag.name }]);
    }
  }

  const articlesData = (topArticles ?? []).map((a) => {
    const dbTags = articleTagsMap.get(a.id) ?? [];
    const articleTags = dbTags.length > 0 ? dbTags : inferTags(a.title, a.description);
    return {
      ...a,
      sources: a.sources as unknown as { name: string; handle: string; logo_url: string | null } | null,
      tags: articleTags,
    };
  });

  return (
    <Shell>
      <DiscoveryClient
        sources={sourcesData}
        tags={tags}
        articles={articlesData}
        followedSourceIds={followedSourceIds}
        mutedSourceIds={mutedSourceIds}
        likedIds={likedIds}
        bookmarkedIds={bookmarkedIds}
        isLoggedIn={!!user}
      />
    </Shell>
  );
}
