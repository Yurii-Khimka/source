"""Seed the sources table with initial RSS sources."""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

SOURCE = {
    "handle": "ukrpravda",
    "name": "Українська правда",
    "rss_url": "https://www.pravda.com.ua/rss/",
    "site_url": "https://www.pravda.com.ua",
    "language": "uk",
    "verification_status": "system_aggregated",
    "is_hidden": False,
}


def main():
    # Check if already exists
    existing = (
        supabase.table("sources")
        .select("id")
        .eq("handle", SOURCE["handle"])
        .execute()
    )

    if existing.data:
        print(f"Source '{SOURCE['handle']}' already exists — skipping.")
        return

    result = supabase.table("sources").insert(SOURCE).execute()
    print(f"Inserted source: {result.data[0]['handle']} (id: {result.data[0]['id']})")


if __name__ == "__main__":
    main()
