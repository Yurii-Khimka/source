import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { inferTags } from "@/lib/tag-keywords";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: articles, error } = await supabase
      .from("articles")
      .select("id, title, url, published_at, description, image_url, like_count, source_id, sources:sources(name, handle, logo_url)")
      .eq("is_hidden", false)
      .order("published_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch article_tags for these articles
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

    // Fetch user interaction state
    const { data: { user } } = await supabase.auth.getUser();
    let likedIds: string[] = [];
    let bookmarkedIds: string[] = [];

    if (user && articleIds.length > 0) {
      const [likesRes, bookmarksRes] = await Promise.all([
        supabase.from("likes").select("article_id").eq("user_id", user.id).in("article_id", articleIds),
        supabase.from("bookmarks").select("article_id").eq("user_id", user.id).in("article_id", articleIds),
      ]);
      likedIds = (likesRes.data ?? []).map((r) => r.article_id);
      bookmarkedIds = (bookmarksRes.data ?? []).map((r) => r.article_id);
    }

    // Enrich articles with tags
    const enrichedArticles = (articles ?? []).map((article) => {
      const dbTags = articleTagsMap[article.id] ?? [];
      const tags = dbTags.length > 0 ? dbTags : inferTags(article.title, article.description);
      return {
        ...article,
        sources: article.sources as unknown as { name: string; handle: string; logo_url: string | null } | null,
        tags,
      };
    });

    return NextResponse.json({
      articles: enrichedArticles,
      likedIds,
      bookmarkedIds,
    });
  } catch (error) {
    console.error("Articles API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
