"""Read-only health check for The Source database.

Usage:  python scripts/diagnose.py            # overview
        python scripts/diagnose.py you@mail   # also check one user's data

Makes NO changes. Needs SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and
SUPABASE_SERVICE_ROLE_KEY in the environment or in .env.local.
"""

import os
import sys

from dotenv import load_dotenv
from supabase import create_client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")


def count(sb, table, **eq):
    q = sb.table(table).select("*", count="exact", head=True)
    for k, v in eq.items():
        q = q.eq(k, v)
    return q.execute().count or 0


def main():
    if not URL or not KEY:
        sys.exit("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY first")
    try:
        sb = create_client(URL, KEY)
        latest = (
            sb.table("articles").select("published_at, fetched_at")
            .order("published_at", desc=True).limit(1).execute().data
        )
    except Exception as e:
        print(f"Cannot reach the database: {e}")
        print("-> Check the Supabase dashboard: the project may be PAUSED.")
        return

    print("=== Tables ===")
    for t in ("sources", "articles", "article_tags", "tags", "profiles",
              "bookmarks", "likes", "follows", "mutes"):
        try:
            print(f"  {t:14} {count(sb, t)}")
        except Exception as e:
            print(f"  {t:14} ERROR {e}")
    print(f"  hidden articles {count(sb, 'articles', is_hidden=True)}")
    print(f"\nNewest article: {latest[0] if latest else 'none'}")

    users = sb.auth.admin.list_users()
    print(f"\n=== Auth users: {len(users)} ===")
    for u in users:
        providers = (u.app_metadata or {}).get("providers") or [(u.app_metadata or {}).get("provider")]
        print(f"  {u.email:40} id={u.id} providers={providers} created={str(u.created_at)[:10]}")

    if len(sys.argv) > 1:
        email = sys.argv[1].lower()
        matches = [u for u in users if (u.email or "").lower() == email]
        if not matches:
            print(f"\nNo auth user with email {email}")
        for u in matches:
            print(f"\n=== Data for {u.email} ({u.id}) ===")
            print(f"  profile row: {bool(sb.table('profiles').select('id').eq('id', u.id).execute().data)}")
            for t in ("bookmarks", "likes", "follows", "mutes"):
                print(f"  {t:10} {count(sb, t, user_id=u.id)}")


if __name__ == "__main__":
    main()
