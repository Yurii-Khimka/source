import { createClient } from "@/lib/supabase/server";
import { createClient as createPublicClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { DiscoveryClient } from "./discovery-client";

function getPublicSupabase() {
  return createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const getDiscoveryPublicData = unstable_cache(
  async () => {
    const sb = getPublicSupabase();
    const now = Date.now();
    const yesterday = new Date(now - 86400000).toISOString();
    const twoDaysAgo = new Date(now - 2 * 86400000).toISOString();

    const [
      { data: sources },
      { data: allTags },
      { data: tagRows24h },
      { data: tagRows48h },
      { data: recentArticles },
      { data: allFollows },
    ] = await Promise.all([
      sb
        .from("sources")
        .select("id, handle, name, site_url, logo_url, verification_status")
        .eq("is_hidden", false)
        .order("name"),
      sb.from("tags").select("id, slug, name:label"),
      sb
        .from("article_tags")
        .select("tag_id, articles!inner(published_at, is_hidden)")
        .eq("articles.is_hidden", false)
        .gte("articles.published_at", yesterday),
      sb
        .from("article_tags")
        .select("tag_id, articles!inner(published_at, is_hidden)")
        .eq("articles.is_hidden", false)
        .gte("articles.published_at", twoDaysAgo)
        .lt("articles.published_at", yesterday),
      sb
        .from("articles")
        .select("id, title, url, published_at, description, image_url, like_count, source_id, sources:sources(name, handle, logo_url, site_url)")
        .eq("is_hidden", false)
        .order("published_at", { ascending: false })
        .limit(20),
      sb.from("follows").select("source_id"),
    ]);

    // Follower counts
    const followerCounts: Record<string, number> = {};
    for (const f of allFollows ?? []) {
      followerCounts[f.source_id] = (followerCounts[f.source_id] ?? 0) + 1;
    }

    // Total counts per tag
    const countsTotal = new Map<string, number>();
    if (allTags && allTags.length > 0) {
      const countResults = await Promise.all(
        allTags.map((t) =>
          sb
            .from("article_tags")
            .select("article_id, articles!inner(id)", { count: "exact", head: true })
            .eq("tag_id", t.id)
            .eq("articles.is_hidden", false)
        )
      );
      allTags.forEach((t, i) => {
        countsTotal.set(t.id, countResults[i].count ?? 0);
      });
    }

    // 24h counts
    const counts24h = new Map<string, number>();
    for (const row of tagRows24h ?? []) {
      counts24h.set(row.tag_id, (counts24h.get(row.tag_id) ?? 0) + 1);
    }

    // 24h–48h counts
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
      logo_url: s.logo_url,
      verification_status: s.verification_status,
      followers_count: followerCounts[s.id] ?? 0,
    }));

    // Attach tags to articles
    const articleIds = (recentArticles ?? []).map((a) => a.id);
    const articleTagsMap: Record<string, { slug: string; name: string }[]> = {};
    if (articleIds.length > 0) {
      const { data: atRows } = await sb
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

    return { sourcesData, tags, recentArticles, articleTagsMap };
  },
  ["discovery-public-data"],
  { revalidate: 300, tags: ["sources", "tags"] }
);

export default async function DiscoveryPage() {
  const supabase = createClient();

  const [publicData, { data: userData }] = await Promise.all([
    getDiscoveryPublicData(),
    supabase.auth.getUser(),
  ]);

  const { sourcesData, tags, recentArticles, articleTagsMap } = publicData;
  const user = userData?.user ?? null;

  let followedSourceIds: string[] = [];
  let likedIds: string[] = [];
  let bookmarkedIds: string[] = [];
  let mutedSourceIds: string[] = [];

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
      sources: a.sources as unknown as { name: string; handle: string; logo_url: string | null; site_url: string | null } | null,
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
    <DiscoveryClient
      sources={sourcesData}
      tags={tags}
      followedSourceIds={followedSourceIds}
      isLoggedIn={!!user}
      articles={articlesData}
    />
  );
}
