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
    { data: tagRows24h },
    { data: tagRows48h },
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
      .select("id, slug, name:label"),
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
    supabase.auth.getUser(),
  ]);

  const user = userData?.user ?? null;

  let followedSourceIds: string[] = [];
  const followerCounts: Record<string, number> = {};

  if (user) {
    const { data: follows } = await supabase
      .from("follows")
      .select("source_id")
      .eq("user_id", user.id);
    followedSourceIds = (follows ?? []).map((f) => f.source_id);
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

  return (
    <Shell>
      <DiscoveryClient
        sources={sourcesData}
        tags={tags}
        followedSourceIds={followedSourceIds}
        isLoggedIn={!!user}
      />
    </Shell>
  );
}
