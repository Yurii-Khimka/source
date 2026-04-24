/**
 * Keyword-based tag matching for articles without DB tags.
 * This is a temporary fallback until the RSS fetcher assigns tags.
 */

const TAG_KEYWORDS: Record<string, string[]> = {
  economy: ["економік", "економіч", "фінанс", "ринок",
    "бюджет", "інфляц", "ввп", "валют", "гривн", "нбу", "мвф",
    "кредит", "торгівл", "експорт", "імпорт",
    "economy", "economic", "market", "finance", "bank", "inflation", "gdp", "trade"],
  conflict: ["війна", "конфлікт", "армія", "військ", "оборон",
    "зеленськ", "зсу", "нато", "фронт", "окупац", "окупант", "ракет", "удар",
    "наступ", "бригад", "батальйон", "полон", "загибл",
    "дрон", "ворог", "тцк", "мобілізац", "генштаб", "обстріл",
    "war", "military", "attack", "conflict", "missile", "defense", "defence", "troops"],
  ukraine: ["україна", "ukrainian",
    "київ", "києв", "харків", "харков", "львів", "львов", "одеса", "одес",
    "маріупол", "донецьк", "запоріжж",
    "херсон", "сум", "дніпр",
    "ukraine", "kyiv", "zelenskyy", "zelensky"],
  europe: ["євросоюз", "євро", "ес ",
    "europe", "eu", "european", "brussels"],
  climate: ["клімат", "екологі", "енергетик",
    "climate", "energy", "green", "carbon", "renewable", "emission"],
  tech: ["технолог", "наука",
    "technology", "tech", "ai", "digital", "cyber", "software"],
  politics: ["політик", "уряд", "влад", "парламент",
    "міністр", "президент", "кабінет", "верховна рада", "законопроект",
    "санкц", "дипломат", "посол",
    "politics", "political", "election", "government", "parliament", "vote"],
  investigation: ["розслідуван", "investigation", "investigat"],
  world: ["світ", "міжнародн",
    "переговор", "саміт", "оон", "g7", "g20",
    "world", "international", "global", "united nations", "un"],
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

  return matched.length > 0
    ? matched
    : [{ slug: "general", name: "General" }];
}
