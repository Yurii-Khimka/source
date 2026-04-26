import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { inferTags } from "@/lib/tag-keywords";

export async function GET() {
  try {
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

    const yesterday = new Date(Date.now() - 86400000).toISOString();

    const [
      { count: totalSources },
      { count: totalArticles },
      { data: recentLikeUsers },
      { data: recentBookmarkUsers },
      { data: recentFollowUsers },
      { data: trendingSources },
    ] = await Promise.all([
      supabase.from("sources").select("*", { count: "exact", head: true }).eq("is_hidden", false),
      supabase.from("articles").select("*", { count: "exact", head: true }).eq("is_hidden", false),
      supabase.from("likes").select("user_id").gte("created_at", yesterday),
      supabase.from("bookmarks").select("user_id").gte("created_at", yesterday),
      supabase.from("follows").select("user_id").gte("created_at", yesterday),
      supabase.from("sources").select("id, handle, name").eq("is_hidden", false).order("name").limit(5),
    ]);

    const activeUserIds = new Set<string>();
    for (const r of recentLikeUsers ?? []) activeUserIds.add(r.user_id);
    for (const r of recentBookmarkUsers ?? []) activeUserIds.add(r.user_id);
    for (const r of recentFollowUsers ?? []) activeUserIds.add(r.user_id);
    const recentUsers = activeUserIds.size;

    // Recent tags
    let recentTags: { slug: string; name: string; count: number }[] = [];

    const { data: recentTagRows } = await supabase
      .from("article_tags")
      .select("tag_id, tags!inner(slug, name:label), articles!inner(published_at)")
      .gte("articles.published_at", yesterday);

    if (recentTagRows && recentTagRows.length > 0) {
      const counts = new Map<string, { slug: string; name: string; count: number }>();
      for (const row of recentTagRows) {
        const tag = row.tags as unknown as { slug: string; name: string };
        const existing = counts.get(tag.slug);
        if (existing) existing.count++;
        else counts.set(tag.slug, { slug: tag.slug, name: tag.name, count: 1 });
      }
      recentTags = Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 9);
    } else {
      const { data: allTagRows } = await supabase
        .from("article_tags")
        .select("tag_id, tags!inner(slug, name:label)");

      if (allTagRows && allTagRows.length > 0) {
        const counts = new Map<string, { slug: string; name: string; count: number }>();
        for (const row of allTagRows) {
          const tag = row.tags as unknown as { slug: string; name: string };
          const existing = counts.get(tag.slug);
          if (existing) existing.count++;
          else counts.set(tag.slug, { slug: tag.slug, name: tag.name, count: 1 });
        }
        recentTags = Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 9);
      } else {
        // Fallback: infer from recent articles
        const { data: recentArticles } = await supabase
          .from("articles")
          .select("title, description")
          .eq("is_hidden", false)
          .order("published_at", { ascending: false })
          .limit(100);

        if (recentArticles && recentArticles.length > 0) {
          const counts = new Map<string, { slug: string; name: string; count: number }>();
          for (const article of recentArticles) {
            const tags = inferTags(article.title, article.description);
            for (const tag of tags) {
              const existing = counts.get(tag.slug);
              if (existing) existing.count++;
              else counts.set(tag.slug, { slug: tag.slug, name: tag.name, count: 1 });
            }
          }
          recentTags = Array.from(counts.values()).sort((a, b) => b.count - a.count).slice(0, 8);
        }
      }
    }

    return NextResponse.json({
      stats: {
        activeUsers: recentUsers ?? 0,
        totalSources: totalSources ?? 0,
        totalArticles: totalArticles ?? 0,
      },
      trendingSources: trendingSources ?? [],
      recentTags,
    });
  } catch (error) {
    console.error("Right rail error:", error);
    return NextResponse.json({
      stats: { activeUsers: 0, totalSources: 0, totalArticles: 0 },
      trendingSources: [],
      recentTags: [],
    });
  }
}
