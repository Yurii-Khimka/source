import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";
import { SourceProfileClient } from "./source-profile-client";
import { inferTags } from "@/lib/tag-keywords";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function SourceProfilePage({
  params,
}: {
  params: { handle: string };
}) {
  const supabase = createClient();
  const { handle } = params;

  // Fetch source by handle
  const { data: source } = await supabase
    .from("sources")
    .select("id, handle, name, site_url, description, created_at, verification_status")
    .eq("handle", handle)
    .eq("is_hidden", false)
    .maybeSingle();

  if (!source) {
    notFound();
  }

  // Parallel: articles, post count, follower count, user data
  const [
    { data: articles },
    { count: postCount },
    { data: allFollows },
    { data: userData },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select(
        "id, title, url, published_at, description, image_url, like_count, source_id, sources:sources(name, handle, logo_url)"
      )
      .eq("source_id", source.id)
      .eq("is_hidden", false)
      .order("published_at", { ascending: false })
      .range(0, 19),
    supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("source_id", source.id)
      .eq("is_hidden", false),
    supabase
      .from("follows")
      .select("user_id")
      .eq("source_id", source.id),
    supabase.auth.getUser(),
  ]);

  const user = userData?.user ?? null;
  const followerCount = allFollows?.length ?? 0;

  // User-specific state
  let likedIds: string[] = [];
  let bookmarkedIds: string[] = [];
  let isFollowing = false;
  let isMuted = false;

  if (user) {
    const articleIds = (articles ?? []).map((a) => a.id);
    const [likesRes, bookmarksRes, followRes, muteRes] = await Promise.all([
      articleIds.length > 0
        ? supabase.from("likes").select("article_id").eq("user_id", user.id).in("article_id", articleIds)
        : Promise.resolve({ data: [] }),
      articleIds.length > 0
        ? supabase.from("bookmarks").select("article_id").eq("user_id", user.id).in("article_id", articleIds)
        : Promise.resolve({ data: [] }),
      supabase
        .from("follows")
        .select("id")
        .eq("user_id", user.id)
        .eq("source_id", source.id)
        .maybeSingle(),
      supabase
        .from("mutes")
        .select("id")
        .eq("user_id", user.id)
        .eq("source_id", source.id)
        .maybeSingle(),
    ]);
    likedIds = (likesRes.data ?? []).map((r: { article_id: string }) => r.article_id);
    bookmarkedIds = (bookmarksRes.data ?? []).map((r: { article_id: string }) => r.article_id);
    isFollowing = !!followRes.data;
    isMuted = !!muteRes.data;
  }

  // Enrich articles with tags
  const articleIds = (articles ?? []).map((a) => a.id);
  const articleTagsMap: Record<string, { slug: string; name: string }[]> = {};

  if (articleIds.length > 0) {
    const { data: tagRows } = await supabase
      .from("article_tags")
      .select("article_id, tags!inner(slug, name:label)")
      .in("article_id", articleIds);

    for (const row of tagRows ?? []) {
      const tag = row.tags as unknown as { slug: string; name: string };
      if (!articleTagsMap[row.article_id]) {
        articleTagsMap[row.article_id] = [];
      }
      articleTagsMap[row.article_id].push(tag);
    }
  }

  const feedArticles = (articles ?? []).map((article) => {
    const dbTags = articleTagsMap[article.id] ?? [];
    const tags =
      dbTags.length > 0 ? dbTags : inferTags(article.title, article.description);
    return {
      ...article,
      sources: article.sources as unknown as {
        name: string;
        handle: string;
        logo_url: string | null;
      } | null,
      tags,
    };
  });

  return (
    <Shell>
      <SourceProfileClient
        source={{
          id: source.id,
          handle: source.handle,
          name: source.name,
          site_url: source.site_url,
          description: source.description,
          created_at: source.created_at,
          verification_status: source.verification_status,
        }}
        articles={feedArticles}
        likedIds={likedIds}
        bookmarkedIds={bookmarkedIds}
        initialFollowing={isFollowing}
        initialMuted={isMuted}
        isLoggedIn={!!user}
        followerCount={followerCount}
        postCount={postCount ?? 0}
      />
    </Shell>
  );
}
