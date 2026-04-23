import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";
import { ArticleCard } from "@/components/article-card";

export const revalidate = 0;

export default async function BookmarksPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Shell>
        <p
          className="text-center py-16"
          style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: "#6C727E" }}
        >
          Sign in to save bookmarks
        </p>
      </Shell>
    );
  }

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("article_id, created_at, articles:articles(id, title, url, published_at, description, image_url, like_count, source_id, is_hidden, sources:sources(name, handle, logo_url))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const articles = (bookmarks ?? [])
    .map((b) => b.articles as unknown as {
      id: string; title: string; url: string; published_at: string | null;
      description: string | null; image_url: string | null; like_count: number;
      source_id: string; is_hidden: boolean;
      sources: { name: string; handle: string; logo_url: string | null } | null;
    })
    .filter((a) => a && !a.is_hidden);

  // Fetch liked/followed/muted state
  const [likesRes, followsRes, mutesRes] = await Promise.all([
    supabase.from("likes").select("article_id").eq("user_id", user.id),
    supabase.from("follows").select("source_id").eq("user_id", user.id),
    supabase.from("mutes").select("source_id").eq("user_id", user.id),
  ]);
  const likedIds = new Set((likesRes.data ?? []).map((r) => r.article_id));
  const followedIds = new Set((followsRes.data ?? []).map((r) => r.source_id));
  const mutedIds = new Set((mutesRes.data ?? []).map((r) => r.source_id));

  const count = articles.length;

  return (
    <Shell>
      <div className="mb-4">
        <h1
          style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: 24,
            fontWeight: 700,
            color: "#EEF1F6",
          }}
        >
          Bookmarks
        </h1>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#6C727E",
            marginTop: 4,
          }}
        >
          {count} saved article{count !== 1 ? "s" : ""}
        </p>
      </div>

      {count === 0 ? (
        <p
          className="text-center py-12"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#6C727E",
          }}
        >
          {"// nothing saved yet"}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              initialLiked={likedIds.has(article.id)}
              initialLikeCount={article.like_count}
              initialBookmarked={true}
              initialFollowing={followedIds.has(article.source_id)}
              initialMuted={mutedIds.has(article.source_id)}
              sourceId={article.source_id}
              isLoggedIn={true}
            />
          ))}
        </div>
      )}
    </Shell>
  );
}
