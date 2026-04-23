import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function Home() {
  const supabase = createClient();

  const { data: articles, error } = await supabase
    .from("articles")
    .select("title, url, published_at, source:sources(name)")
    .order("published_at", { ascending: false })
    .limit(20);

  if (error) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <p className="text-red-400">Error loading articles: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "var(--font-geist-mono), monospace" }}
      >
        SORCE
      </h1>

      <ul className="divide-y divide-white/10">
        {articles?.map((article) => {
          const sourceName =
            (article.source as { name: string } | null)?.name ?? "Unknown";

          return (
            <li key={article.url} className="py-4">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <div
                  className="text-xs text-gray-500 mb-1"
                  style={{ fontFamily: "var(--font-geist-mono), monospace" }}
                >
                  {sourceName} &middot;{" "}
                  {article.published_at
                    ? new Date(article.published_at).toLocaleString("uk-UA", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—"}
                </div>
                <div
                  className="text-base text-gray-200 group-hover:text-white transition-colors"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {article.title}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
