import { createClient } from "@/lib/supabase/server";
import { FollowingClient } from "./following-client";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function FollowingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  // Followed sources
  const { data: sourceFollows } = await supabase
    .from("follows")
    .select("source_id")
    .eq("user_id", user.id)
    .not("source_id", "is", null);

  const sourceIds = (sourceFollows ?? [])
    .map((f) => f.source_id)
    .filter((id): id is string => id != null);

  let followedSources: {
    id: string;
    handle: string;
    name: string;
    logo_url: string | null;
    verification_status: string | null;
  }[] = [];

  if (sourceIds.length > 0) {
    const { data } = await supabase
      .from("sources")
      .select("id, handle, name, logo_url, verification_status")
      .in("id", sourceIds)
      .eq("is_hidden", false)
      .order("name");
    followedSources = data ?? [];
  }

  // Followed tags
  const { data: tagFollows } = await supabase
    .from("follows")
    .select("tag_id")
    .eq("user_id", user.id)
    .not("tag_id", "is", null);

  const tagIds = (tagFollows ?? [])
    .map((f) => f.tag_id)
    .filter((id): id is string => id != null);

  let followedTags: {
    id: string;
    slug: string;
    name: string;
    postCount: number;
  }[] = [];

  if (tagIds.length > 0) {
    const { data: tags } = await supabase
      .from("tags")
      .select("id, slug, name:label")
      .in("id", tagIds);

    // Count posts per tag
    const { data: tagArticles } = await supabase
      .from("article_tags")
      .select("tag_id")
      .in("tag_id", tagIds);

    const countMap = new Map<string, number>();
    for (const row of tagArticles ?? []) {
      countMap.set(row.tag_id, (countMap.get(row.tag_id) ?? 0) + 1);
    }

    followedTags = (tags ?? []).map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      postCount: countMap.get(t.id) ?? 0,
    })).sort((a, b) => b.postCount - a.postCount);
  }

  return (
    <FollowingClient
      sources={followedSources}
      tags={followedTags}
    />
  );
}
