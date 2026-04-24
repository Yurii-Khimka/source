import { createClient } from "@/lib/supabase/server";
import { dark } from "@/lib/tokens";
import Link from "next/link";

export const revalidate = 0;

const mono = "'JetBrains Mono', monospace";
const serif = "'Source Serif 4', Georgia, serif";

export default async function TagsPage() {
  const supabase = createClient();

  const [{ data: allTags }, { data: allTagRows }] = await Promise.all([
    supabase.from("tags").select("id, slug, name:label"),
    supabase.from("article_tags").select("tag_id"),
  ]);

  // Count articles per tag
  const countsTotal = new Map<string, number>();
  for (const row of allTagRows ?? []) {
    countsTotal.set(row.tag_id, (countsTotal.get(row.tag_id) ?? 0) + 1);
  }

  const tags = (allTags ?? [])
    .map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      count: countsTotal.get(t.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{ padding: "32px 36px 60px" }}>
        <h1
          style={{
            fontFamily: serif,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: -0.5,
            color: dark.text,
            margin: 0,
          }}
        >
          Tags
        </h1>
        <p
          style={{
            fontFamily: mono,
            fontSize: 11,
            color: dark.textMute,
            marginTop: 6,
            marginBottom: 24,
          }}
        >
          {tags.length} tags · sorted by post count
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              style={{
                fontFamily: mono,
                fontSize: 13,
                color: dark.text,
                padding: "8px 14px",
                borderRadius: 6,
                border: `1px solid ${dark.line2}`,
                background: dark.surface,
                textDecoration: "none",
                transition: "border-color 0.12s, background 0.12s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>#{tag.name}</span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  color: dark.textMute,
                  background: dark.surface2,
                  border: `1px solid ${dark.line2}`,
                  borderRadius: 3,
                  padding: "1px 5px",
                  lineHeight: 1.4,
                }}
              >
                {tag.count}
              </span>
            </Link>
          ))}
        </div>

        {tags.length === 0 && (
          <p
            className="text-center py-12"
            style={{ fontFamily: mono, fontSize: 12, color: dark.textMute }}
          >
            No tags yet.
          </p>
        )}
    </div>
  );
}
