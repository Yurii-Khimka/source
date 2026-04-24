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

## Component Consistency Rules

These rules are MANDATORY. Violations will be rejected.

1. **Never duplicate styles.** If a UI element (pill, badge, avatar, card) already exists as a component, reuse it. Do not write inline styles that recreate it.

2. **Hashtag pills** — one canonical style, defined in `article-card.tsx`:
   - fontMono, fontSize 11, color textSub
   - padding 2px 7px, border 1px solid line2, borderRadius 3
   - background: tokens.surface
   Use this exact style everywhere: article cards, right rail, tag pages, search results.

3. **Before creating any styled element**, search the codebase for an existing component that does the same thing.

4. **Token enforcement** — never use hardcoded hex values or pixel sizes that are not in `src/lib/tokens.ts`.

5. **After every task** — check that the changed component matches every other place the same element is used.

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
