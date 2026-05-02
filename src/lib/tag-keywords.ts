/**
 * Scored tag inference for articles — UI fallback.
 * Single source of truth: src/lib/tag-keywords.json
 */

import tagData from "./tag-keywords.json";

type TagEntry = { strong: string[]; normal: string[]; negative: string[] };
const TAG_DATA: Record<string, TagEntry> = tagData;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function inferTags(
  title: string,
  description: string | null
): { slug: string; name: string }[] {
  const titleLower = title.toLowerCase();
  const descLower = (description ?? "").toLowerCase();

  const scores: { slug: string; score: number }[] = [];

  for (const [slug, entry] of Object.entries(TAG_DATA)) {
    let score = 0;

    // Check negatives first
    const hasNegative = entry.negative.some(
      (kw) => titleLower.includes(kw) || descLower.includes(kw)
    );
    if (hasNegative) continue;

    // Score strong keywords (weight 3)
    for (const kw of entry.strong) {
      const re = new RegExp(
        "(^|[^\\p{L}\\p{N}])" + escapeRegex(kw) + "\\p{L}*",
        "iu"
      );
      let contribution = 0;
      if (re.test(titleLower)) contribution += 3 * 3; // weight * title multiplier
      if (re.test(descLower)) contribution += 3 * 1; // weight * desc multiplier
      score += Math.min(contribution, 6);
    }

    // Score normal keywords (weight 1)
    for (const kw of entry.normal) {
      const re = new RegExp(
        "(^|[^\\p{L}\\p{N}])" + escapeRegex(kw) + "\\p{L}*",
        "iu"
      );
      let contribution = 0;
      if (re.test(titleLower)) contribution += 1 * 3;
      if (re.test(descLower)) contribution += 1 * 1;
      score += Math.min(contribution, 6);
    }

    if (score >= 3) {
      scores.push({ slug, score });
    }
  }

  // Sort descending, take top 3
  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, 3);

  return top.map((t) => ({
    slug: t.slug,
    name: t.slug.charAt(0).toUpperCase() + t.slug.slice(1),
  }));
}
