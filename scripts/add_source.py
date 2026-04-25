"""Add a single RSS source to the database."""

import argparse
import os
from urllib.parse import urlparse

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")


def logo_url_for(site_url: str) -> str:
    domain = urlparse(site_url).netloc or site_url
    return f"https://www.google.com/s2/favicons?domain={domain}&sz=64"


def main():
    parser = argparse.ArgumentParser(description="Add a single RSS source")
    parser.add_argument("--handle", required=True)
    parser.add_argument("--name", required=True)
    parser.add_argument("--rss", required=True)
    parser.add_argument("--site", required=True)
    parser.add_argument("--lang", required=True)
    args = parser.parse_args()

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    row = {
        "handle": args.handle,
        "name": args.name,
        "rss_url": args.rss,
        "site_url": args.site,
        "language": args.lang,
        "verification_status": "system_aggregated",
        "is_hidden": False,
        "logo_url": logo_url_for(args.site),
    }

    existing = (
        supabase.table("sources")
        .select("id")
        .eq("handle", row["handle"])
        .execute()
    )

    if existing.data:
        supabase.table("sources").update(row).eq("handle", row["handle"]).execute()
        print(f"  Updated existing source: {row['handle']}")
    else:
        result = supabase.table("sources").insert(row).execute()
        print(f"  Inserted: {result.data[0]['handle']} (id: {result.data[0]['id']})")


if __name__ == "__main__":
    main()
