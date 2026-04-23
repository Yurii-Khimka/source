"""Seed the sources table with initial RSS sources."""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

SOURCES = [
    {"handle": "ukrpravda", "name": "Українська правда", "rss_url": "https://www.pravda.com.ua/rss/", "site_url": "https://www.pravda.com.ua", "language": "uk"},
    {"handle": "hromadske", "name": "Громадське", "rss_url": "https://hromadske.ua/rss", "site_url": "https://hromadske.ua", "language": "uk"},
    {"handle": "suspilne", "name": "Суспільне новини", "rss_url": "https://suspilne.media/rss/all.rss", "site_url": "https://suspilne.media", "language": "uk"},
    {"handle": "skhemy", "name": "Схеми", "rss_url": "https://www.radiosvoboda.org/api/epiqq", "site_url": "https://www.radiosvoboda.org/z/632", "language": "uk"},
    {"handle": "slidstvo", "name": "Слідство.Інфо", "rss_url": "https://slidstvo.info/feed/", "site_url": "https://slidstvo.info", "language": "uk"},
    {"handle": "babel", "name": "Бабель", "rss_url": "https://babel.ua/rss", "site_url": "https://babel.ua", "language": "uk"},
    {"handle": "kyivindependent", "name": "The Kyiv Independent", "rss_url": "https://kyivindependent.com/feed/", "site_url": "https://kyivindependent.com", "language": "en"},
    {"handle": "rferl", "name": "Radio Free Europe", "rss_url": "https://www.rferl.org/api/ziqumrmpiq", "site_url": "https://www.rferl.org", "language": "en"},
    {"handle": "euronews", "name": "Euronews", "rss_url": "https://www.euronews.com/rss", "site_url": "https://www.euronews.com", "language": "en"},
    {"handle": "bbc", "name": "BBC News", "rss_url": "http://feeds.bbci.co.uk/news/rss.xml", "site_url": "https://bbc.com/news", "language": "en"},
    {"handle": "guardian", "name": "The Guardian", "rss_url": "https://www.theguardian.com/world/rss", "site_url": "https://theguardian.com", "language": "en"},
    {"handle": "dw", "name": "Deutsche Welle", "rss_url": "https://rss.dw.com/rdf/rss-en-all", "site_url": "https://dw.com", "language": "en"},
]


def main():
    for source in SOURCES:
        row = {
            **source,
            "verification_status": "system_aggregated",
            "is_hidden": False,
        }

        existing = (
            supabase.table("sources")
            .select("id")
            .eq("handle", row["handle"])
            .execute()
        )

        if existing.data:
            # Update existing source to keep rss_url / name / site_url in sync
            supabase.table("sources").update(row).eq("handle", row["handle"]).execute()
            print(f"  🔄 '{row['handle']}' already exists — updated.")
            continue

        result = supabase.table("sources").insert(row).execute()
        print(f"  ✅ Inserted: {result.data[0]['handle']} (id: {result.data[0]['id']})")

    print("\nDone seeding sources.")


if __name__ == "__main__":
    main()
