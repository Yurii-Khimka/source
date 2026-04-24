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
    // Tags from last 24h
    supabase
      .from("article_tags")
      .select("tag_id, tags!inner(id, slug, name), articles!inner(published_at)")
      .gte("articles.published_at", yesterday),
    // Tags from 24h–48h ago (for delta calculation)
    supabase
      .from("article_tags")
      .select("tag_id, tags!inner(id, slug, name), articles!inner(published_at)")
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

  // Build 24h tag counts
  const currentCounts = new Map<string, { id: string; slug: string; name: string; count: number }>();
  for (const row of tagRows24h ?? []) {
    const tag = row.tags as unknown as { id: string; slug: string; name: string };
    const existing = currentCounts.get(tag.id);
    if (existing) existing.count++;
    else currentCounts.set(tag.id, { id: tag.id, slug: tag.slug, name: tag.name, count: 1 });
  }

  // Build 24h–48h tag counts for delta
  const prevCounts = new Map<string, number>();
  for (const row of tagRows48h ?? []) {
    const tag = row.tags as unknown as { id: string };
    prevCounts.set(tag.id, (prevCounts.get(tag.id) ?? 0) + 1);
  }

  const tags = Array.from(currentCounts.values())
    .sort((a, b) => b.count - a.count)
    .map((t) => {
      const prev = prevCounts.get(t.id) ?? 0;
      const delta = prev === 0 ? null : Math.round(((t.count - prev) / prev) * 100);
      return { ...t, delta };
    });

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
