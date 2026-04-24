"""RSS fetcher for The Source — fetches articles from all sources."""

import os
import re
from datetime import datetime, timezone
from html.parser import HTMLParser

import io

import feedparser
import httpx
from PIL import Image


class HTMLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.reset()
        self.fed = []

    def handle_data(self, d):
        self.fed.append(d)

    def get_data(self):
        return ' '.join(self.fed).strip()


def strip_html(html):
    s = HTMLStripper()
    s.feed(html)
    return s.get_data()
MIN_IMAGE_WIDTH = 400
MIN_IMAGE_HEIGHT = 200


def check_image(url: str) -> str | None:
    """Return url if image meets minimum dimensions, else None."""
    try:
        resp = httpx.get(url, timeout=5, follow_redirects=True)
        resp.raise_for_status()
        img = Image.open(io.BytesIO(resp.content))
        w, h = img.size
        if w < MIN_IMAGE_WIDTH or h < MIN_IMAGE_HEIGHT:
            print(f"  [skip image] {url} — {w}x{h}")
            return None
        return url
    except Exception:
        print(f"  [skip image] {url} — fetch failed")
        return None


def upgrade_guardian_image(url: str) -> str:
    """Upgrade Guardian/guim.co.uk image URLs to high resolution."""
    if "guardian.com" not in url and "guim.co.uk" not in url:
        return url
    if re.search(r"[?&]width=\d+", url):
        url = re.sub(r"(width=)\d+", r"\g<1>1200", url)
    else:
        url += "&width=1200" if "?" in url else "?width=1200"
    url = re.sub(r"(quality=)\d+", r"\g<1>85", url)
    return url


# Keyword fallback tagging — matches Ukrainian and English keywords to tags
TAG_KEYWORDS: dict[str, list[str]] = {
    "economy":       ["економік", "економіч", "фінанс", "ринок",
                      "economy", "economic", "market", "finance", "bank", "inflation", "gdp", "trade"],
    "politics":      ["політик", "уряд", "влад", "парламент",
                      "politics", "political", "election", "government", "parliament", "vote"],
    "conflict":      ["війна", "конфлікт", "армія", "військ", "оборон",
                      "war", "military", "attack", "conflict", "missile", "defense", "defence", "troops"],
    "investigation": ["розслідуван",
                      "investigation", "investigat"],
    "europe":        ["євросоюз", "євро", "ес ",
                      "europe", "eu", "european", "brussels"],
    "ukraine":       ["україна", "ukrainian",
                      "ukraine", "kyiv", "zelenskyy", "zelensky"],
    "world":         ["світ", "міжнародн",
                      "world", "international", "global", "united nations"],
    "tech":          ["технолог", "наука",
                      "technology", "tech", "ai", "digital", "cyber", "software", "science"],
    "climate":       ["клімат", "екологі", "енергетик",
                      "climate", "energy", "green", "carbon", "renewable"],
}


def infer_tags(title: str, description: str | None) -> list[str]:
    """Return list of tag slugs matched by keyword search."""
    text = f"{title} {description or ''}".lower()
    matched = []
    for slug, keywords in TAG_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            matched.append(slug)
    return matched


def assign_tags(supabase, article_id: str, tag_slugs: list[str], url: str):
    """Look up or create tags, then link to article via article_tags."""
    if not tag_slugs:
        return

    for slug in tag_slugs:
        # Upsert tag (get existing or create)
        tag_resp = (
            supabase.table("tags")
            .select("id")
            .eq("slug", slug)
            .maybe_single()
            .execute()
        )
        if tag_resp.data:
            tag_id = tag_resp.data["id"]
        else:
            name = slug.capitalize()
            insert_resp = (
                supabase.table("tags")
                .insert({"slug": slug, "name": name})
                .execute()
            )
            tag_id = insert_resp.data[0]["id"]

        # Insert article_tag link (ignore duplicates)
        try:
            supabase.table("article_tags").insert({
                "article_id": article_id,
                "tag_id": tag_id,
            }).execute()
        except Exception as e:
            if "23505" not in str(e):
                raise

    print(f"  [tags] {url[:60]} → {tag_slugs}")


from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")


def parse_published(entry) -> str | None:
    """Extract published date as ISO string."""
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
        return dt.isoformat()
    return None


def fetch_source(supabase, source):
    """Fetch and insert articles for a single source."""
    source_id = source["id"]
    name = source["name"]
    rss_url = source["rss_url"]
    language = source["language"]

    feed = feedparser.parse(rss_url)
    entries = feed.entries
    fetched = len(entries)

    # Get existing URLs for this source to skip duplicates
    existing_resp = (
        supabase.table("articles")
        .select("url")
        .eq("source_id", source_id)
        .execute()
    )
    existing_urls = {row["url"] for row in existing_resp.data}

    inserted = 0
    skipped = 0

    for entry in entries:
        url = entry.get("link", "").strip()
        if not url:
            skipped += 1
            continue

        if url in existing_urls:
            skipped += 1
            continue

        title = entry.get("title", "").strip()
        raw_desc = entry.get("summary", "").strip()
        description = strip_html(raw_desc)[:300] if raw_desc else ""
        published_at = parse_published(entry) or datetime.now(timezone.utc).isoformat()

        image_url = None
        if hasattr(entry, "media_content") and entry.media_content:
            image_url = entry.media_content[0].get("url")
        elif hasattr(entry, "enclosures") and entry.enclosures:
            enc = entry.enclosures[0]
            if enc.get("type", "").startswith("image/"):
                image_url = enc.get("href")

        if image_url:
            image_url = upgrade_guardian_image(image_url)
            image_url = check_image(image_url)

        article = {
            "source_id": source_id,
            "title": title,
            "url": url,
            "description": description or None,
            "image_url": image_url,
            "language": language,
            "published_at": published_at,
        }

        try:
            insert_resp = supabase.table("articles").insert(article).execute()
            inserted += 1

            # Assign tags via keyword fallback
            article_id = insert_resp.data[0]["id"]

            # Try RSS categories first
            rss_tags: list[str] = []
            if hasattr(entry, "tags") and entry.tags:
                for t in entry.tags:
                    term = (t.get("term") or "").strip().lower()
                    if term and term in TAG_KEYWORDS:
                        rss_tags.append(term)

            # Keyword fallback if RSS categories yielded nothing
            if not rss_tags:
                rss_tags = infer_tags(title, description)

            assign_tags(supabase, article_id, rss_tags, url)
        except Exception as e:
            if "23505" in str(e):
                skipped += 1
            else:
                raise

    print(f"  {name}: fetched={fetched}, inserted={inserted}, skipped={skipped}")
    return inserted, skipped


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Get all sources
    sources_resp = (
        supabase.table("sources")
        .select("id, handle, name, rss_url, language")
        .execute()
    )
    sources = sources_resp.data
    print(f"Found {len(sources)} sources\n")

    total_inserted = 0
    total_skipped = 0

    for source in sources:
        try:
            ins, skip = fetch_source(supabase, source)
            total_inserted += ins
            total_skipped += skip
        except Exception as e:
            print(f"  ❌ {source['name']}: error — {e}")

    print(f"\nDone: {total_inserted} inserted, {total_skipped} skipped across {len(sources)} sources")


if __name__ == "__main__":
    main()
