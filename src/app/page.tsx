import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";
import { Feed } from "@/components/feed";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, url, published_at, description, image_url, like_count, source_id, sources:sources(name, handle, logo_url)")
    .order("published_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <Shell>
        <p className="text-red-400">Error loading articles: {error.message}</p>
      </Shell>
    );
  }

  const { data: { user } } = await supabase.auth.getUser();

  let likedIds: string[] = [];
  let bookmarkedIds: string[] = [];
  let followedSourceIds: string[] = [];
  let mutedSourceIds: string[] = [];

  if (user) {
    const [likesRes, bookmarksRes, followsRes, mutesRes] = await Promise.all([
      supabase.from("likes").select("article_id").eq("user_id", user.id),
      supabase.from("bookmarks").select("article_id").eq("user_id", user.id),
      supabase.from("follows").select("source_id").eq("user_id", user.id),
      supabase.from("mutes").select("source_id").eq("user_id", user.id),
    ]);
    likedIds = (likesRes.data ?? []).map((r) => r.article_id);
    bookmarkedIds = (bookmarksRes.data ?? []).map((r) => r.article_id);
    followedSourceIds = (followsRes.data ?? []).map((r) => r.source_id);
    mutedSourceIds = (mutesRes.data ?? []).map((r) => r.source_id);
  }

  const feedArticles = (articles ?? []).map((article) => ({
    ...article,
    sources: article.sources as unknown as { name: string; handle: string; logo_url: string | null } | null,
  }));

  return (
    <Shell>
      <Feed
        articles={feedArticles}
        likedIds={likedIds}
        bookmarkedIds={bookmarkedIds}
        followedSourceIds={followedSourceIds}
        mutedSourceIds={mutedSourceIds}
        isLoggedIn={!!user}
      />
    </Shell>
  );
}
