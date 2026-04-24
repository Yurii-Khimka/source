# The Source — Claude Code Context

## What this project is
A chronological news aggregator. Sources are RSS feeds curated by Admin.
No user-generated content. No algorithms.

## Key rules — never break these
- articles table uses `url` as the unique deduplication key
- sources table has: handle, name, rss_url, site_url, language, verification_status, is_hidden
- articles table has: source_id, title, url, description, image_url, language, published_at, fetched_at, is_hidden, like_count, bookmark_count
- Always use SUPABASE_SERVICE_ROLE_KEY for Python scripts
- Never add columns that are not in the schema above
- Never create pages or components unless explicitly asked

## Docs
- docs/PRD.md — product requirements
- docs/TECH_STACK.md — full stack and DB schema
- docs/SESSION_STATE.md — current progress

## Stack
- Next.js 14 App Router + Tailwind + shadcn/ui
- Supabase (PostgreSQL + Auth + RLS)
- Python 3.14 + supabase==2.10.0 + feedparser==6.0.11
- Virtual env in scripts/venv/

## What is done
- DB schema created in Supabase (9 tables)
- RLS policies applied
- scripts/fetcher.py — working
- scripts/seed_sources.py — working
- ukrpravda seeded, 20 articles fetched

## Auto-update rule (MANDATORY)
After completing ANY task, Claude Code MUST run:
  python scripts/update_session.py --completed "[task name]" --note "[brief summary]"

This is not optional. Every single task ends with this command.
If the script fails, fix it before committing.
Always run this BEFORE the git commit.

So the end of every task looks like:
  python scripts/update_session.py --completed "X" --note "Y"
  git add .
  git commit -m "..."
