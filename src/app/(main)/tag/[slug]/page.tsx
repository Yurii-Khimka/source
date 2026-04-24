import { createClient } from "@/lib/supabase/server";
import { TagProfileClient } from "./tag-profile-client";
import { TagActionBlock } from "./tag-action-block";
import { RightRailInjector } from "@/components/right-rail-injector";
import { inferTags } from "@/lib/tag-keywords";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function TagPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { slug } = params;

  // Fetch tag from DB
  const { data: tag } = await supabase
    .from("tags")
    .select("id, name:label, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!tag) {
    notFound();
  }

  // Fetch article IDs for this tag + total count
  const { data: articleTagRows } = await supabase
    .from("article_tags")
    .select("article_id")
    .eq("tag_id", tag.id);

  const tagArticleIds = (articleTagRows ?? []).map((r) => r.article_id);
  const postCount = tagArticleIds.length;

  if (postCount === 0) {
    notFound();
  }

  // Fetch first page of articles
  const { data: articles } = await supabase
    .from("articles")
    .select(
      "id, title, url, published_at, description, image_url, like_count, source_id, sources:sources(name, handle, logo_url)"
    )
    .in("id", tagArticleIds)
    .eq("is_hidden", false)
    .order("published_at", { ascending: false })
    .range(0, 19);

  // Top sources — count articles per source for this tag
  const sourceCountMap = new Map<string, number>();
  const sourceIdSet = new Set<string>();
  for (const a of articles ?? []) {
    sourceIdSet.add(a.source_id);
    sourceCountMap.set(a.source_id, (sourceCountMap.get(a.source_id) ?? 0) + 1);
  }

  // For accurate counts, count from all tagArticleIds
  // Fetch source_id for all tagged articles
  if (tagArticleIds.length > 0) {
    // Clear and rebuild from full dataset
    sourceCountMap.clear();
    const batchSize = 500;
    for (let i = 0; i < tagArticleIds.length; i += batchSize) {
      const batch = tagArticleIds.slice(i, i + batchSize);
      const { data: sourceRows } = await supabase
        .from("articles")
        .select("source_id")
        .in("id", batch)
        .eq("is_hidden", false);
      for (const row of sourceRows ?? []) {
        sourceCountMap.set(row.source_id, (sourceCountMap.get(row.source_id) ?? 0) + 1);
      }
    }
  }

  // Fetch source details for top 5
  const topSourceIds = Array.from(sourceCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let topSources: { handle: string; name: string; logo_url: string | null; postCount: number }[] = [];
  if (topSourceIds.length > 0) {
    const { data: sourceDetails } = await supabase
      .from("sources")
      .select("id, handle, name, logo_url")
      .in("id", topSourceIds);
    topSources = topSourceIds.map((id) => {
      const src = (sourceDetails ?? []).find((s) => s.id === id);
      return {
        handle: src?.handle ?? "",
        name: src?.name ?? "",
        logo_url: src?.logo_url ?? null,
        postCount: sourceCountMap.get(id) ?? 0,
      };
    });
  }

  // User state
  const { data: { user } } = await supabase.auth.getUser();

  let likedIds: string[] = [];
  let bookmarkedIds: string[] = [];
  let followedSourceIds: string[] = [];
  let mutedSourceIds: string[] = [];
  let isFollowingTag = false;
  let isMutedTag = false;

  if (user) {
    const ids = (articles ?? []).map((a) => a.id);
    const [likesRes, bookmarksRes, followsRes, mutesRes, tagFollowRes, tagMuteRes] = await Promise.all([
      ids.length > 0
        ? supabase.from("likes").select("article_id").eq("user_id", user.id).in("article_id", ids)
        : Promise.resolve({ data: [] }),
      ids.length > 0
        ? supabase.from("bookmarks").select("article_id").eq("user_id", user.id).in("article_id", ids)
        : Promise.resolve({ data: [] }),
      supabase.from("follows").select("source_id").eq("user_id", user.id).not("source_id", "is", null),
      supabase.from("mutes").select("source_id").eq("user_id", user.id).not("source_id", "is", null),
      supabase
        .from("follows")
        .select("id")
        .eq("user_id", user.id)
        .eq("tag_id", tag.id)
        .is("source_id", null)
        .maybeSingle(),
      supabase
        .from("mutes")
        .select("id")
        .eq("user_id", user.id)
        .eq("tag_id", tag.id)
        .is("source_id", null)
        .maybeSingle(),
    ]);
    likedIds = (likesRes.data ?? []).map((r: { article_id: string }) => r.article_id);
    bookmarkedIds = (bookmarksRes.data ?? []).map((r: { article_id: string }) => r.article_id);
    followedSourceIds = (followsRes.data ?? []).filter((r): r is { source_id: string } => r.source_id != null).map((r) => r.source_id);
    mutedSourceIds = (mutesRes.data ?? []).filter((r): r is { source_id: string } => r.source_id != null).map((r) => r.source_id);
    isFollowingTag = !!tagFollowRes.data;
    isMutedTag = !!tagMuteRes.data;
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
      const t = row.tags as unknown as { slug: string; name: string };
      if (!articleTagsMap[row.article_id]) {
        articleTagsMap[row.article_id] = [];
      }
      articleTagsMap[row.article_id].push(t);
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
    for (const t of article.tags) {
      const existing = tagMap.get(t.slug);
      if (existing) {
        existing.articleIds.push(article.id);
        existing.count++;
      } else {
        tagMap.set(t.slug, { id: t.slug, slug: t.slug, name: t.name, articleIds: [article.id], count: 1 });
      }
    }
  }
  const feedTags = Array.from(tagMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map(({ id, slug: s, name, articleIds }) => ({ id, slug: s, name, articleIds }));

  return (
    <>
      <RightRailInjector>
        <TagActionBlock
          tagId={tag.id}
          initialFollowing={isFollowingTag}
          initialMuted={isMutedTag}
          isLoggedIn={!!user}
        />
      </RightRailInjector>
      <TagProfileClient
        slug={slug}
        postCount={postCount}
        topSources={topSources}
        articles={feedArticles}
        likedIds={likedIds}
        bookmarkedIds={bookmarkedIds}
        followedSourceIds={followedSourceIds}
        mutedSourceIds={mutedSourceIds}
        isLoggedIn={!!user}
        tags={feedTags}
      />
    </>
  );
}
