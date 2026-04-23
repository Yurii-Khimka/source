import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";
import { ArticleCard } from "@/components/article-card";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();

  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, title, url, published_at, description, image_url, like_count, sources:sources(name, handle)")
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <Shell>
        <p className="text-red-400">Error loading articles: {error.message}</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-4">
        {articles?.map((article) => (
          <ArticleCard
            key={article.id}
            article={{
              ...article,
              sources: article.sources as unknown as { name: string; handle: string } | null,
            }}
          />
        ))}
      </div>
    </Shell>
  );
}
