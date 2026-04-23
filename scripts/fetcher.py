"""RSS fetcher for SORCE — fetches articles from Ukrainska Pravda."""

import os
import re
from datetime import datetime, timezone

import feedparser
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
RSS_URL = "https://www.pravda.com.ua/rss/"


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text[:200]


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
        .select("id")
        .eq("handle", "ukrpravda")
        .single()
        .execute()
    )
    source_id = source_resp.data["id"]

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

        article = {
            "source_id": source_id,
            "title": title,
            "slug": slugify(title),
            "url": url,
            "summary": description or None,
            "status": "published",
            "published_at": published_at,
        }

        supabase.table("articles").insert(article).execute()
        inserted += 1

    print(f"Done: {inserted} inserted, {skipped} skipped")


if __name__ == "__main__":
    main()
