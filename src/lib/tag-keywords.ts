/**
 * Keyword-based tag matching for articles without DB tags.
 * This is a temporary fallback until the RSS fetcher assigns tags.
 */

const TAG_KEYWORDS: Record<string, string[]> = {
  economy: ["economy", "economic", "market", "finance", "bank", "inflation", "gdp", "trade"],
  conflict: ["war", "military", "attack", "conflict", "missile", "defense", "defence", "troops"],
  ukraine: ["ukraine", "ukrainian", "kyiv", "zelenskyy", "zelensky"],
  europe: ["europe", "eu", "european", "brussels"],
  climate: ["climate", "energy", "green", "carbon", "renewable", "emission"],
  tech: ["technology", "tech", "ai", "digital", "cyber", "software"],
  politics: ["politics", "political", "election", "government", "parliament", "vote"],
  world: ["world", "international", "global", "united nations", "un"],
};

export function inferTags(
  title: string,
  description: string | null
): { slug: string; name: string }[] {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  const matched: { slug: string; name: string }[] = [];

  for (const [slug, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.push({ slug, name: slug.charAt(0).toUpperCase() + slug.slice(1) });
    }
  }

  return matched;
}
