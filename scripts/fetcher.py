"""RSS fetcher for The Source — fetches articles from all sources."""

import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser

import io

import feedparser
import httpx
from PIL import Image


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
MIN_IMAGE_WIDTH = 400
MIN_IMAGE_HEIGHT = 200


def check_image(url: str) -> str | None:
    """Return url if image meets minimum dimensions, else None."""
    try:
        resp = httpx.get(url, timeout=5, follow_redirects=True)
        resp.raise_for_status()
        img = Image.open(io.BytesIO(resp.content))
        w, h = img.size
        if w < MIN_IMAGE_WIDTH or h < MIN_IMAGE_HEIGHT:
            print(f"  [skip image] {url} — {w}x{h}")
            return None
        return url
    except Exception:
        print(f"  [skip image] {url} — fetch failed")
        return None


def upgrade_guardian_image(url: str) -> str:
    """Upgrade Guardian/guim.co.uk image URLs to high resolution."""
    if "guardian.com" not in url and "guim.co.uk" not in url:
        return url
    if re.search(r"[?&]width=\d+", url):
        url = re.sub(r"(width=)\d+", r"\g<1>1200", url)
    else:
        url += "&width=1200" if "?" in url else "?width=1200"
    url = re.sub(r"(quality=)\d+", r"\g<1>85", url)
    return url


# --- Scored tag matcher (single source of truth: src/lib/tag-keywords.json) ---

_JSON_PATH = os.path.join(
    os.path.dirname(__file__), "..", "src", "lib", "tag-keywords.json"
)
with open(_JSON_PATH, encoding="utf-8") as _f:
    TAG_DATA: dict[str, dict[str, list[str]]] = json.load(_f)


def _match_keyword(kw: str, text: str) -> bool:
    """Word-boundary match: kw preceded by non-letter/start, followed by zero+ letters."""
    pattern = r"(?<!\w)" + re.escape(kw) + r"\w*"
    return bool(re.search(pattern, text, re.UNICODE | re.IGNORECASE))


def infer_tags(title: str, description: str | None) -> list[str]:
    """Return up to 3 tag slugs using the scored word-boundary matcher."""
    title_lower = title.lower()
    desc_lower = (description or "").lower()

    scores: list[tuple[str, int]] = []

    for slug, entry in TAG_DATA.items():
        # Check negatives (substring is fine for small list)
        has_negative = any(
            kw in title_lower or kw in desc_lower for kw in entry["negative"]
        )
        if has_negative:
            continue

        score = 0

        # Strong keywords (weight 3)
        for kw in entry["strong"]:
            contribution = 0
            if _match_keyword(kw, title_lower):
                contribution += 3 * 3  # weight * title multiplier
            if _match_keyword(kw, desc_lower):
                contribution += 3 * 1  # weight * desc multiplier
            score += min(contribution, 6)

        # Normal keywords (weight 1)
        for kw in entry["normal"]:
            contribution = 0
            if _match_keyword(kw, title_lower):
                contribution += 1 * 3  # weight * title multiplier
            if _match_keyword(kw, desc_lower):
                contribution += 1 * 1  # weight * desc multiplier
            score += min(contribution, 6)

        if score >= 3:
            scores.append((slug, score))

    # Sort descending by score, take top 3
    scores.sort(key=lambda x: x[1], reverse=True)
    return [s[0] for s in scores[:3]]


def assign_tags(supabase, article_id: str, tag_slugs: list[str], url: str):
    """Look up or create tags, then link to article via article_tags."""
    if not tag_slugs:
        print(f"  [tags] {url[:60]} → none (low confidence)")
        return

    for slug in tag_slugs:
        # Upsert tag (get existing or create)
        tag_resp = (
            supabase.table("tags")
            .select("id")
            .eq("slug", slug)
            .maybe_single()
            .execute()
        )
        if tag_resp.data:
            tag_id = tag_resp.data["id"]
        else:
            label = slug.capitalize()
            insert_resp = (
                supabase.table("tags")
                .insert({"slug": slug, "label": label})
                .execute()
            )
            tag_id = insert_resp.data[0]["id"]

        # Insert article_tag link (ignore duplicates)
        try:
            supabase.table("article_tags").insert({
                "article_id": article_id,
                "tag_id": tag_id,
            }).execute()
        except Exception as e:
            if "23505" not in str(e):
                raise

    print(f"  [tags] {url[:60]} → {tag_slugs}")


from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import config  # noqa: E402  (after load_dotenv so .env.local can override it)

SUPABASE_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")


def parse_published(entry) -> datetime | None:
    """Extract published (or updated) date as an aware UTC datetime."""
    for attr in ("published_parsed", "updated_parsed"):
        parsed = getattr(entry, attr, None) or entry.get(attr)
        if parsed:
            return datetime(*parsed[:6], tzinfo=timezone.utc)
    return None


def entry_url(entry) -> str:
    """Canonical dedup key for an entry: its link, or its guid if that is a URL."""
    url = (entry.get("link") or "").strip()
    if not url:
        guid = (entry.get("id") or "").strip()
        if guid.startswith(("http://", "https://")):
            url = guid
    return url


def chunks(items: list, size: int):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def existing_urls_for(supabase, urls: list[str]) -> set[str]:
    """Return the subset of `urls` that already exist in articles.

    Only the URLs in the current feed are looked up (in small chunks), so this
    stays correct no matter how many articles are in the DB. The old approach
    loaded all URLs for a source, which PostgREST silently capped at 1000 rows.
    """
    found: set[str] = set()
    for chunk in chunks(urls, 50):
        resp = supabase.table("articles").select("url").in_("url", chunk).execute()
        found.update(row["url"] for row in (resp.data or []))
    return found


def fetch_source(supabase, source, cutoff: datetime | None):
    """Fetch a feed and insert only articles that are not in the DB yet."""
    source_id = source["id"]
    name = source["name"]
    rss_url = source["rss_url"]
    language = source["language"]

    feed = feedparser.parse(rss_url)
    entries = feed.entries
    fetched = len(entries)
    if feed.get("bozo") and not entries:
        raise RuntimeError(f"feed error: {feed.get('bozo_exception')}")

    # 1. Build the candidate list: unique URL, not older than the retention window.
    candidates = []
    seen: set[str] = set()
    too_old = 0
    for entry in entries:
        url = entry_url(entry)
        if not url or url in seen:
            continue
        seen.add(url)
        published = parse_published(entry)
        if cutoff and published and published < cutoff:
            too_old += 1  # would be cleaned up straight away — don't insert
            continue
        candidates.append((url, entry, published))

    # 2. One lookup for just these URLs; keep only the new ones.
    existing = existing_urls_for(supabase, [c[0] for c in candidates]) if candidates else set()
    new_items = [c for c in candidates if c[0] not in existing]

    inserted = 0
    skipped = fetched - len(new_items)

    for url, entry, published in new_items:
        title = entry.get("title", "").strip()
        raw_desc = entry.get("summary", "").strip()
        description = strip_html(raw_desc)[:300] if raw_desc else ""
        published_at = (published or datetime.now(timezone.utc)).isoformat()

        image_url = None
        if hasattr(entry, "media_content") and entry.media_content:
            image_url = entry.media_content[0].get("url")
        elif hasattr(entry, "enclosures") and entry.enclosures:
            enc = entry.enclosures[0]
            if enc.get("type", "").startswith("image/"):
                image_url = enc.get("href")

        if image_url:
            image_url = upgrade_guardian_image(image_url)
            image_url = check_image(image_url)

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
            insert_resp = supabase.table("articles").insert(article).execute()
            inserted += 1

            article_id = insert_resp.data[0]["id"]

            # Try RSS categories first
            rss_tags: list[str] = []
            if hasattr(entry, "tags") and entry.tags:
                for t in entry.tags:
                    term = (t.get("term") or "").strip().lower()
                    if term and term in TAG_DATA:
                        rss_tags.append(term)

            # Keyword fallback if RSS categories yielded nothing
            if not rss_tags:
                rss_tags = infer_tags(title, description)

            assign_tags(supabase, article_id, rss_tags, url)
        except Exception as e:
            if "23505" in str(e):  # raced with another insert — already there
                skipped += 1
            else:
                raise

    print(
        f"  {name}: fetched={fetched}, new={len(new_items)}, inserted={inserted}, "
        f"skipped={skipped}, too_old={too_old}"
    )
    return inserted, skipped


def bookmarked_article_ids(supabase) -> set[str]:
    """All article ids that at least one user has bookmarked (paginated)."""
    ids: set[str] = set()
    page = 1000
    start = 0
    while True:
        resp = (
            supabase.table("bookmarks")
            .select("article_id")
            .range(start, start + page - 1)
            .execute()
        )
        rows = resp.data or []
        ids.update(r["article_id"] for r in rows)
        if len(rows) < page:
            return ids
        start += page


def cleanup_old_articles(supabase, cutoff: datetime):
    """Hide or delete articles older than the cutoff.

    Bookmarked articles are never touched: deleting them would cascade-delete
    users' bookmarks, and hiding them would remove them from the Bookmarks page.
    """
    if config.RETENTION_MODE == "off":
        print("\n--- Retention --- off")
        return

    protected = bookmarked_article_ids(supabase)

    # Collect old article ids (paginated; in hide mode only still-visible ones).
    old_ids: list[str] = []
    page = 1000
    start = 0
    while True:
        q = supabase.table("articles").select("id").lt("published_at", cutoff.isoformat())
        if config.RETENTION_MODE == "hide":
            q = q.eq("is_hidden", False)
        rows = q.order("id").range(start, start + page - 1).execute().data or []
        old_ids.extend(r["id"] for r in rows)
        if len(rows) < page:
            break
        start += page

    targets = [i for i in old_ids if i not in protected]
    kept = len(old_ids) - len(targets)

    for chunk in chunks(targets, 100):
        if config.RETENTION_MODE == "delete":
            supabase.table("articles").delete().in_("id", chunk).execute()
        else:
            supabase.table("articles").update({"is_hidden": True}).in_("id", chunk).execute()

    verb = "deleted" if config.RETENTION_MODE == "delete" else "hidden"
    print(
        f"\n--- Retention ({config.RETENTION_DAYS} days, mode={config.RETENTION_MODE}) ---\n"
        f"  older than {cutoff.date()}: {len(old_ids)}, {verb}: {len(targets)}, "
        f"kept because bookmarked: {kept}"
    )


def randomize_counters(supabase):
    """Give every visible article new random like/bookmark counters.

    Uses the randomize_article_counters() SQL function (migration 007) so it is
    a single UPDATE instead of thousands of HTTP calls.
    """
    if not config.RANDOMIZE_COUNTERS:
        return
    try:
        resp = supabase.rpc(
            "randomize_article_counters",
            {"p_min": config.COUNTER_MIN, "p_max": config.COUNTER_MAX},
        ).execute()
        print(
            f"\n--- Counters --- randomised {resp.data} articles "
            f"in [{config.COUNTER_MIN}, {config.COUNTER_MAX}]"
        )
    except Exception as e:
        print(
            "\n  [WARN] counters not randomised — apply "
            f"supabase/migrations/007_randomize_counters.sql first ({e})"
        )


def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        sys.exit("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set")

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    cutoff = None
    if config.RETENTION_MODE != "off":
        cutoff = datetime.now(timezone.utc) - timedelta(days=config.RETENTION_DAYS)

    sources_resp = (
        supabase.table("sources")
        .select("id, handle, name, rss_url, language")
        .execute()
    )
    sources = sources_resp.data
    print(f"Found {len(sources)} sources\n")

    total_inserted = 0
    total_skipped = 0
    failed = 0

    for source in sources:
        try:
            ins, skip = fetch_source(supabase, source, cutoff)
            total_inserted += ins
            total_skipped += skip
        except Exception as e:
            failed += 1
            print(f"  ❌ {source['name']}: error — {e}")

    print(f"\nDone: {total_inserted} inserted, {total_skipped} skipped across {len(sources)} sources")

    if cutoff:
        cleanup_old_articles(supabase, cutoff)
    randomize_counters(supabase)

    validate(supabase, total_inserted, sources)

    # Make a fully broken run visible as a failed job in GitHub Actions.
    if sources and failed == len(sources):
        sys.exit("All sources failed — check the database and feeds")


def validate(supabase, inserted_count: int, sources: list[dict]):
    """Post-run validation — report data consistency issues."""
    print("\n--- Validation ---")
    has_warn = False

    # 1. Articles inserted this run
    print(f"  [validation] articles inserted this run: {inserted_count}")

    # 2. Articles with no tags
    all_articles_resp = supabase.table("articles").select("id, url").eq("is_hidden", False).execute()
    tagged_resp = supabase.table("article_tags").select("article_id").execute()
    tagged_ids = {r["article_id"] for r in (tagged_resp.data or [])}
    untagged = [a for a in (all_articles_resp.data or []) if a["id"] not in tagged_ids]
    no_tags_count = len(untagged)

    if no_tags_count > 0:
        has_warn = True
        sample = ", ".join(a["url"][:60] for a in untagged[:3])
        print(f"  [WARN] [validation] articles with no tags: {no_tags_count} — {sample}")
    else:
        print(f"  [validation] articles with no tags: 0")

    # 3. Articles with no source_id
    no_source_resp = (
        supabase.table("articles")
        .select("id", count="exact")
        .is_("source_id", "null")
        .execute()
    )
    no_source_count = no_source_resp.count or 0
    if no_source_count > 0:
        has_warn = True
        print(f"  [WARN] [validation] articles with no source_id: {no_source_count}")
    else:
        print(f"  [validation] articles with no source_id: 0")

    # 4. Sources with 0 articles in last 24h
    yesterday = (datetime.now(timezone.utc).timestamp() - 86400)
    yesterday_iso = datetime.fromtimestamp(yesterday, tz=timezone.utc).isoformat()
    empty_handles = []
    for source in sources:
        count_resp = (
            supabase.table("articles")
            .select("id", count="exact", head=True)
            .eq("source_id", source["id"])
            .gte("published_at", yesterday_iso)
            .execute()
        )
        if (count_resp.count or 0) == 0:
            empty_handles.append(source["handle"])

    if empty_handles:
        has_warn = True
        print(f"  [WARN] [validation] sources with 0 articles in last 24h: {', '.join(empty_handles)}")
    else:
        print(f"  [validation] sources with 0 articles in last 24h: none")

    # 5. Total tags in DB
    tags_resp = supabase.table("tags").select("id", count="exact", head=True).execute()
    print(f"  [validation] total tags in DB: {tags_resp.count or 0}")

    # Summary
    if has_warn:
        print("  [WARN] validation completed with warnings")
    else:
        print("  [validation] OK — all checks passed")


if __name__ == "__main__":
    main()
