import { createClient } from "@/lib/supabase/server";
import { SourceProfileClient } from "./source-profile-client";
import { SourceActionBlock } from "./source-action-block";
import { RightRailInjector } from "@/components/right-rail-injector";
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

  const { data: source } = await supabase
    .from("sources")
    .select("id, handle, name, site_url, created_at, verification_status, logo_url")
    .eq("handle", handle)
    .eq("is_hidden", false)
    .maybeSingle();

  if (!source) {
    notFound();
  }

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

  let likedIds: string[] = [];
  let bookmarkedIds: string[] = [];
  let isFollowing = false;
  let isMuted = false;

  if (user) {
    const ids = (articles ?? []).map((a) => a.id);
    const [likesRes, bookmarksRes, followRes, muteRes] = await Promise.all([
      ids.length > 0
        ? supabase.from("likes").select("article_id").eq("user_id", user.id).in("article_id", ids)
        : Promise.resolve({ data: [] }),
      ids.length > 0
        ? supabase.from("bookmarks").select("article_id").eq("user_id", user.id).in("article_id", ids)
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

  // Build tag filter data from enriched articles
  const tagMap = new Map<string, { id: string; slug: string; name: string; articleIds: string[]; count: number }>();
  for (const article of feedArticles) {
    for (const tag of article.tags) {
      const existing = tagMap.get(tag.slug);
      if (existing) {
        existing.articleIds.push(article.id);
        existing.count++;
      } else {
        tagMap.set(tag.slug, { id: tag.slug, slug: tag.slug, name: tag.name, articleIds: [article.id], count: 1 });
      }
    }
  }
  const feedTags = Array.from(tagMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(({ id, slug, name, articleIds }) => ({ id, slug, name, articleIds }));

  return (
    <>
      <RightRailInjector>
        <SourceActionBlock
          sourceId={source.id}
          initialFollowing={isFollowing}
          initialMuted={isMuted}
          isLoggedIn={!!user}
        />
      </RightRailInjector>
      <SourceProfileClient
        source={{
          id: source.id,
          handle: source.handle,
          name: source.name,
          site_url: source.site_url,
          created_at: source.created_at,
          verification_status: source.verification_status,
          logo_url: source.logo_url,
        }}
        articles={feedArticles}
        likedIds={likedIds}
        bookmarkedIds={bookmarkedIds}
        initialFollowing={isFollowing}
        initialMuted={isMuted}
        isLoggedIn={!!user}
        followerCount={followerCount}
        postCount={postCount ?? 0}
        tags={feedTags}
      />
    </>
  );
}
