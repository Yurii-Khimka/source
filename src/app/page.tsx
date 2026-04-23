import { createClient } from "@/lib/supabase/server";
import { Shell } from "@/components/shell";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();

  const { data: articles, error } = await supabase
    .from("articles")
    .select("title, url, published_at, description, image_url, source:sources(name)")
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
      <ul className="divide-y divide-white/10">
        {articles?.map((article) => {
          const sourceName =
            (article.source as unknown as { name: string } | null)?.name ?? "Unknown";

          return (
            <li key={article.url} className="py-4">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group flex gap-4"
              >
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt=""
                    className="w-[120px] h-[80px] object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div
                    className="text-xs text-gray-500 mb-1"
                    style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                  >
                    {sourceName} &middot;{" "}
                    {article.published_at
                      ? new Date(article.published_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        }).replace(",", " ·")
                      : "—"}
                  </div>
                  <div
                    className="text-base text-gray-200 group-hover:text-white transition-colors"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {article.title}
                  </div>
                  {article.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {article.description}
                    </p>
                  )}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
