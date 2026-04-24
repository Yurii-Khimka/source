"""One-time script to backfill Guardian image URLs to high resolution."""

import os
import re

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")


def upgrade_url(url: str) -> str:
    if re.search(r"[?&]width=\d+", url):
        url = re.sub(r"(width=)\d+", r"\g<1>1200", url)
    else:
        url += "&width=1200" if "?" in url else "?width=1200"
    url = re.sub(r"(quality=)\d+", r"\g<1>85", url)
    return url


def main():
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
    print(f"Found {total} Guardian articles with images\n")

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
