"""RSS fetcher for SORCE — fetches articles from all sources."""

import os
from datetime import datetime, timezone
from html.parser import HTMLParser

import feedparser


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
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]


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
            supabase.table("articles").insert(article).execute()
            inserted += 1
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
