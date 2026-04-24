"""One-time script to backfill Guardian image URLs to high resolution.

Usage:
  python scripts/upgrade_guardian_images.py --dry-run   # preview changes
  python scripts/upgrade_guardian_images.py              # apply changes
"""

import argparse
import os
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")


def upgrade_url(url: str) -> str:
    parsed = urlparse(url)
    params = parse_qs(parsed.query, keep_blank_values=True)
    params["width"] = ["1200"]
    params["quality"] = ["85"]
    new_query = urlencode(params, doseq=True)
    return urlunparse(parsed._replace(query=new_query))


def main():
    parser = argparse.ArgumentParser(description="Upgrade Guardian image URLs")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without writing to DB")
    args = parser.parse_args()

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Fetch Guardian articles with images
    rows = []
    for pattern in ["guim.co.uk", "guardian.com"]:
        resp = (
            supabase.table("articles")
            .select("id, image_url")
            .like("image_url", f"%{pattern}%")
            .execute()
        )
        rows.extend(resp.data)

    # Dedupe by id
    seen = set()
    articles = []
    for row in rows:
        if row["id"] not in seen:
            seen.add(row["id"])
            articles.append(row)

    total = len(articles)
    print(f"Found {total} Guardian articles with images")
    if args.dry_run:
        print("DRY RUN — no changes will be written\n")
    print()

    # Preview first 5
    preview_count = min(5, total)
    if preview_count > 0:
        print(f"--- Preview (first {preview_count}) ---")
        for article in articles[:preview_count]:
            old = article["image_url"]
            new = upgrade_url(old)
            changed = " ✓ changed" if old != new else " (no change)"
            print(f"  BEFORE: {old}")
            print(f"  AFTER:  {new}{changed}")
            print()
        print("---\n")

    if args.dry_run:
        # Count how many would change
        changes = sum(1 for a in articles if upgrade_url(a["image_url"]) != a["image_url"])
        print(f"Would update {changes} of {total} articles.")
        return

    updated = 0
    for i, article in enumerate(articles, 1):
        old_url = article["image_url"]
        new_url = upgrade_url(old_url)

        if new_url == old_url:
            continue

        supabase.table("articles").update({"image_url": new_url}).eq("id", article["id"]).execute()
        updated += 1
        print(f"Updated {updated} of {total}: {article['id']}")

    print(f"\nDone. Updated {updated} articles.")


if __name__ == "__main__":
    main()
