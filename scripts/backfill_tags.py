"""One-time script to assign tags to all existing articles that have no tags."""

import os
import sys

from dotenv import load_dotenv
from supabase import create_client

# Import shared keyword matching from fetcher
sys.path.insert(0, os.path.dirname(__file__))
from fetcher import get_tags_from_text

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Ensure all known tags exist in the DB
    from fetcher import TAG_KEYWORDS
    for slug in TAG_KEYWORDS:
        existing = supabase.table("tags").select("id").eq("slug", slug).execute()
        if not existing.data:
            supabase.table("tags").insert({"slug": slug, "label": slug.capitalize()}).execute()
            print(f"  Created tag: {slug}")

    # Load tag slugs → ids
    tags_resp = supabase.table("tags").select("id, slug").execute()
    tag_map: dict[str, str] = {t["slug"]: t["id"] for t in (tags_resp.data or [])}
    print(f"Tags in DB: {list(tag_map.keys())}")

    # Get all article IDs that already have tags (paginate past 1000-row limit)
    tagged_ids: set[str] = set()
    offset = 0
    while True:
        resp = supabase.table("article_tags").select("article_id").range(offset, offset + 999).execute()
        if not resp.data:
            break
        for r in resp.data:
            tagged_ids.add(r["article_id"])
        if len(resp.data) < 1000:
            break
        offset += 1000
    print(f"Articles already tagged: {len(tagged_ids)}")

    # Get all articles (paginate past 1000-row limit)
    all_articles: list[dict] = []
    offset = 0
    while True:
        resp = (
            supabase.table("articles")
            .select("id, title, description, url")
            .eq("is_hidden", False)
            .range(offset, offset + 999)
            .execute()
        )
        if not resp.data:
            break
        all_articles.extend(resp.data)
        if len(resp.data) < 1000:
            break
        offset += 1000
    untagged = [a for a in all_articles if a["id"] not in tagged_ids]
    print(f"Articles with no tags: {len(untagged)}\n")

    total_updated = 0
    total_tags_assigned = 0

    for i, article in enumerate(untagged):
        text = f"{article['title']} {article['description'] or ''}"
        slugs = get_tags_from_text(text)

        # Filter to only slugs that exist in DB
        valid_slugs = [s for s in slugs if s in tag_map]

        if not valid_slugs:
            continue

        for slug in valid_slugs:
            tag_id = tag_map[slug]
            try:
                supabase.table("article_tags").insert({
                    "article_id": article["id"],
                    "tag_id": tag_id,
                }).execute()
                total_tags_assigned += 1
            except Exception as e:
                if "23505" not in str(e):
                    raise

        total_updated += 1

        if (i + 1) % 100 == 0:
            print(f"  ... processed {i + 1}/{len(untagged)} articles")

    print(f"\nDone: {total_updated} articles updated, {total_tags_assigned} tags assigned")


if __name__ == "__main__":
    main()
