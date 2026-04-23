"""RSS fetcher for SORCE — fetches articles from Ukrainska Pravda."""

import os
from datetime import datetime, timezone

import feedparser
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
RSS_URL = "https://www.pravda.com.ua/rss/"


def parse_published(entry) -> str | None:
    """Extract published date as ISO string."""
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        dt = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
        return dt.isoformat()
    return None


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # 1. Find source
    source_resp = (
        supabase.table("sources")
        .select("id, language")
        .eq("handle", "ukrpravda")
        .single()
        .execute()
    )
    source_id = source_resp.data["id"]
    language = source_resp.data["language"]

    # 2. Fetch RSS
    feed = feedparser.parse(RSS_URL)
    entries = feed.entries
    print(f"Fetched {len(entries)} entries from RSS")

    # 3. Get existing URLs for this source to skip duplicates
    existing_resp = (
        supabase.table("articles")
        .select("url")
        .eq("source_id", source_id)
        .execute()
    )
    existing_urls = {row["url"] for row in existing_resp.data}

    # 4. Prepare new articles
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
        description = entry.get("summary", "").strip()
        published_at = parse_published(entry)

        # Extract image from media content or enclosures if available
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

        supabase.table("articles").insert(article).execute()
        inserted += 1

    print(f"Done: {inserted} inserted, {skipped} skipped")


if __name__ == "__main__":
    main()
