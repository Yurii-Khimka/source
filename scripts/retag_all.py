"""Re-tag every existing article using the scored word-boundary matcher.

Replaces all article_tags with fresh results from the new inference engine.
Use --dry-run to preview changes without writing to the database.
"""

import argparse
import os
import sys

from dotenv import load_dotenv
from supabase import create_client

sys.path.insert(0, os.path.dirname(__file__))
from fetcher import TAG_DATA, infer_tags

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

ALL_TAG_SLUGS = list(TAG_DATA.keys())


def ensure_tags_exist(supabase):
    """Ensure all 12 tag slugs exist. Handle 'general' removal."""
    existing_resp = supabase.table("tags").select("id, slug").execute()
    existing_slugs = {t["slug"]: t["id"] for t in (existing_resp.data or [])}

    # Insert missing tags
    for slug in ALL_TAG_SLUGS:
        if slug not in existing_slugs:
            resp = supabase.table("tags").insert({"slug": slug, "label": slug.capitalize()}).execute()
            existing_slugs[slug] = resp.data[0]["id"]
            print(f"  Created tag: {slug}")

    # Handle 'general' tag
    if "general" in existing_slugs:
        general_id = existing_slugs["general"]
        # Check if any articles reference it
        ref_resp = (
            supabase.table("article_tags")
            .select("article_id")
            .eq("tag_id", general_id)
            .limit(1)
            .execute()
        )
        if ref_resp.data:
            # Count them
            all_refs = paginate_all(supabase, "article_tags", "article_id", [("eq", ("tag_id", general_id))])
            print(f"  [WARN] 'general' tag still referenced by {len(all_refs)} article_tags — leaving in place")
        else:
            supabase.table("tags").delete().eq("id", general_id).execute()
            print("  Removed unused 'general' tag")
            del existing_slugs["general"]

    return existing_slugs


def paginate_all(supabase, table, select, filters=None):
    """Paginate through all rows past Supabase 1000-row limit."""
    all_rows = []
    offset = 0
    while True:
        q = supabase.table(table).select(select)
        if filters:
            for method, args in filters:
                q = getattr(q, method)(*args)
        q = q.range(offset, offset + 999)
        resp = q.execute()
        if not resp.data:
            break
        all_rows.extend(resp.data)
        if len(resp.data) < 1000:
            break
        offset += 1000
    return all_rows


def run_inspect(supabase):
    """Inspector mode: show which articles would remain untagged."""
    print("--- Loading articles ---")
    all_articles = paginate_all(supabase, "articles", "id, title, description, url")
    print(f"  Total articles: {len(all_articles)}\n")

    untagged = []
    for article in all_articles:
        tags = infer_tags(article["title"], article.get("description"))
        if not tags:
            untagged.append(article)

    pct = (len(untagged) / len(all_articles) * 100) if all_articles else 0
    print(f"--- Inspector: {len(untagged)} untagged of {len(all_articles)} ({pct:.1f}%) ---\n")

    for article in untagged[:50]:
        title = article.get("title", "")
        desc = (article.get("description") or "")[:120]
        print(f"[untagged] {title}")
        print(f"           {desc}")

    if len(untagged) > 50:
        print(f"\n... and {len(untagged) - 50} more")


def main():
    parser = argparse.ArgumentParser(description="Re-tag all articles with scored matcher")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--dry-run", action="store_true", help="Preview changes without writing")
    group.add_argument("--inspect", action="store_true", help="Show untagged articles for diagnostic")
    args = parser.parse_args()

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    if args.inspect:
        run_inspect(supabase)
        return

    # Step 1: Ensure tags exist
    print("--- Ensuring tags exist ---")
    tag_slug_to_id = ensure_tags_exist(supabase)
    print(f"  Tags: {list(tag_slug_to_id.keys())}\n")

    # Step 2: Load all articles
    print("--- Loading articles ---")
    all_articles = paginate_all(supabase, "articles", "id, title, description, url")
    print(f"  Total articles: {len(all_articles)}\n")

    # Step 3: Load all current article_tags
    print("--- Loading current article_tags ---")
    all_article_tags = paginate_all(supabase, "article_tags", "article_id, tag_id")
    # Build map: article_id → set of tag_ids
    current_tags_map: dict[str, set[str]] = {}
    for row in all_article_tags:
        current_tags_map.setdefault(row["article_id"], set()).add(row["tag_id"])

    # Build reverse map: tag_id → slug
    tag_id_to_slug = {v: k for k, v in tag_slug_to_id.items()}

    # Stats
    unchanged = 0
    retagged = 0
    newly_tagged = 0
    lost_all = 0
    per_tag_after: dict[str, int] = {slug: 0 for slug in ALL_TAG_SLUGS}

    print("--- Processing articles ---")
    for i, article in enumerate(all_articles):
        new_slugs = infer_tags(article["title"], article.get("description"))
        new_tag_ids = {tag_slug_to_id[s] for s in new_slugs if s in tag_slug_to_id}

        current_tag_ids = current_tags_map.get(article["id"], set())
        # Filter to only tags we know about (ignore orphan references)
        current_known_ids = {tid for tid in current_tag_ids if tid in tag_id_to_slug}

        # Count per-tag stats
        for s in new_slugs:
            if s in per_tag_after:
                per_tag_after[s] += 1

        if new_tag_ids == current_known_ids:
            unchanged += 1
            continue

        had_tags = len(current_known_ids) > 0
        has_tags = len(new_tag_ids) > 0

        if had_tags and has_tags:
            retagged += 1
        elif not had_tags and has_tags:
            newly_tagged += 1
        elif had_tags and not has_tags:
            lost_all += 1
        else:
            unchanged += 1
            continue

        if not args.dry_run:
            # DELETE all current article_tags for this article
            supabase.table("article_tags").delete().eq("article_id", article["id"]).execute()
            # INSERT new tags
            if new_slugs:
                rows = [{"article_id": article["id"], "tag_id": tag_slug_to_id[s]} for s in new_slugs if s in tag_slug_to_id]
                if rows:
                    try:
                        supabase.table("article_tags").insert(rows).execute()
                    except Exception as e:
                        if "23505" not in str(e):
                            raise

        if (i + 1) % 200 == 0:
            print(f"  ... processed {i + 1}/{len(all_articles)}")

    # Print summary
    mode = "DRY-RUN" if args.dry_run else "REAL"
    print(f"\n--- Summary ({mode}) ---")
    print(f"  total articles:        {len(all_articles)}")
    print(f"  unchanged:             {unchanged}")
    print(f"  re-tagged (set diff):  {retagged}")
    print(f"  newly tagged:          {newly_tagged}")
    print(f"  lost all tags:         {lost_all}")
    print(f"  per-tag totals (after):")
    for slug in ALL_TAG_SLUGS:
        print(f"    {slug}: {per_tag_after[slug]}")


if __name__ == "__main__":
    main()
