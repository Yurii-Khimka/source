import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";
import { DiscoveryClient } from "./discovery-client";

export const revalidate = 0;

export default async function DiscoveryPage() {
  const supabase = createClient();

  const yesterday = new Date(Date.now() - 86400000).toISOString();

  const [
    { data: sources },
    { data: tagRows },
    { data: userData },
  ] = await Promise.all([
    supabase
      .from("sources")
      .select("id, handle, name, rss_url, site_url, verification_status")
      .eq("is_hidden", false)
      .order("name"),
    supabase
      .from("article_tags")
      .select("tag_id, tags!inner(id, slug, name), articles!inner(published_at)")
      .gte("articles.published_at", yesterday),
    supabase.auth.getUser(),
  ]);

  const user = userData?.user ?? null;

  let followedSourceIds: string[] = [];
  if (user) {
    const { data: follows } = await supabase
      .from("follows")
      .select("source_id")
      .eq("user_id", user.id);
    followedSourceIds = (follows ?? []).map((f) => f.source_id);
  }

  // Build tag counts from 24h data
  const tagCounts = new Map<string, { id: string; slug: string; name: string; count: number }>();
  for (const row of tagRows ?? []) {
    const tag = row.tags as unknown as { id: string; slug: string; name: string };
    const existing = tagCounts.get(tag.id);
    if (existing) existing.count++;
    else tagCounts.set(tag.id, { id: tag.id, slug: tag.slug, name: tag.name, count: 1 });
  }

  const tags = Array.from(tagCounts.values()).sort((a, b) => b.count - a.count);

  const sourcesData = (sources ?? []).map((s) => ({
    id: s.id,
    handle: s.handle,
    name: s.name,
    site_url: s.site_url,
    verification_status: s.verification_status,
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
