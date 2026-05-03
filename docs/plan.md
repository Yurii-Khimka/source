# SORCE — Current Plan
_Updated by Claude Chat before each task._

## Status
**Active task:** Layer-1 cost reduction — wrap all heavy, public (non-user-specific) DB reads in `unstable_cache` with sensible TTLs across home, discovery, tags, and the right-rail API. Leave per-user reads untouched. Measure response times before and after. **No schema changes, no SQL refactor — that is Layer 2 and comes only if Layer 1 is insufficient.**

## Context
- Owner is paying too much. Root cause: 4 routes pull tens of thousands of `article_tags` rows on every page load with no caching.
- Per-route audit:
  - `src/app/(main)/page.tsx` — `revalidate = 0`, full `article_tags` table scan (~25k rows).
  - `src/app/(main)/discovery/page.tsx` — `revalidate = 0`, two `article_tags` 24h/48h scans.
  - `src/app/(main)/tags/page.tsx` — `revalidate = 0`, full `article_tags.select("tag_id")` scan.
  - `src/app/api/right-rail/route.ts` — no `Cache-Control`, called per navigation via SWR.
- The matcher and the data are fine. Only the read path is wasteful.
- **Critical constraint:** these pages also fetch per-user data (likes, bookmarks, follows, mutes) via auth cookies, which makes the page itself dynamic. Cannot use page-level `revalidate` — it will silently no-op or, worse, leak one user's state to another. Solution is `unstable_cache` (from `next/cache`) wrapping ONLY the public queries.

## Current Task

### Part A — Home page (`src/app/(main)/page.tsx`)

1. Import: `import { unstable_cache } from "next/cache";`
2. Extract the three public queries into module-level cached functions (factor each into its own `async function getX()`, then wrap with `unstable_cache(getX, [cacheKey], { revalidate: 60, tags: ["articles", "tags"] })`):
   - `getRecentArticles()` — the 20-article fetch at line 11. **No user data, no auth.**
   - `getTotalArticleCount()` — the `count: "exact"` query at line 17.
   - `getAllArticleTags()` — the `article_tags` fetch at line 53. **This is the most expensive query in the app.**
3. The `await supabase.auth.getUser()` and the 5 per-user queries (`likes`, `bookmarks`, `follows`, `mutes` × 2) and the muted-tag-articles resolution at line 121 must stay **uncached** and **dynamic per request**.
4. TTL = `60` seconds for all three. Cache tags = `["articles"]` for the article fetches and `["tags"]` for the tag fetch — so we can selectively revalidate later.
5. Remove `export const revalidate = 0;` at the top — it's no longer needed and is misleading once cached functions are introduced.

**Do NOT:**
- Do NOT cache anything that depends on `user.id`.
- Do NOT change query shapes, joins, or scope. This task is caching-only. Layer 2 (scoping the article_tags fetch to 20 IDs) comes later.

### Part B — Discovery page (`src/app/(main)/discovery/page.tsx`)

1. Same pattern: identify every `supabase.from(...)` call that does not depend on the logged-in user. Wrap each in `unstable_cache` with `revalidate: 300` (5 min — sources and tags churn slowly).
2. Cache tags: `["sources"]` for source queries, `["tags"]` for `article_tags` scans.
3. Per-user queries (followed sources, muted) stay dynamic.
4. Remove `export const revalidate = 0;`.

### Part C — Tags page (`src/app/(main)/tags/page.tsx`)

1. Wrap the `tags` + `article_tags.select("tag_id")` fetches in one `unstable_cache` function with `revalidate: 300`.
2. Per-user "followed tags" stays dynamic.
3. Remove `export const revalidate = 0;`.

### Part D — Right-rail API (`src/app/api/right-rail/route.ts`)

1. Read the file first. Identify which response fields are user-specific (likely none — right rail shows trending sources, hashtags, integrity widget) vs public.
2. If the entire response is public:
   - Add response headers: `"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"`.
   - Vercel edge will cache for 5 min, serve stale for 10 min while revalidating. This is the highest-leverage change because right rail loads on every navigation.
3. If parts are user-specific: split the route into `/api/right-rail/public` (cached) and `/api/right-rail/user` (uncached), or move the user-specific bit elsewhere. Use judgment — describe in the reply what you found and what you did.

### Part E — Measurement

1. Build production: `npm run build`.
2. Start prod server: `npm run start &` (background).
3. Wait 5s for boot. Then for each of `/`, `/discovery`, `/tags`, `/api/right-rail`:
   - **Cold** (first request): `curl -o /dev/null -s -w "TTFB %{time_starttransfer}s, total %{time_total}s\n" http://localhost:3000<path>`
   - **Warm** (immediate second request): same curl.
4. Run the same 4 routes BEFORE applying the changes too — `git stash`, build, start, measure, kill, `git stash pop`. This gives a clean A/B.
5. Report a table:
   ```
   Route          Before cold  Before warm  After cold  After warm  Change
   /              X.Xs         X.Xs         Y.Ys        Y.Ys        -Z%
   /discovery     ...
   /tags          ...
   /api/right-rail ...
   ```
6. Kill the prod server.

### Part F — Ship

1. `npm run lint`.
2. `python3 scripts/update_session.py --completed "Layer-1 cost reduction: cache public DB reads" --note "Wrapped article/tag/source queries in unstable_cache (60s on home, 300s on discovery/tags). Added Cache-Control on right-rail API. Per-user queries unchanged. TTFB dropped X% on home (warm)."`
3. Append a `2026-05-03` entry to `docs/changelog.md` with the measurement table from Part E and a one-line note that this is Layer-1 only; Layer-2 (RPC aggregates + scoped queries) deferred pending real-world measurement.
4. Commit message: `perf(cache): wrap public DB reads in unstable_cache; cache right-rail API`

## Output
Reply with:
1. List of cached functions added per file (function name + TTL + cache tags).
2. List of queries that stayed dynamic (and why — name the user-dependent field).
3. What you found in `right-rail/route.ts` and how you handled it.
4. Confirmation `npm run lint` passed.
5. The before/after measurement table from Part E.
6. Confirmation `update_session.py` ran AND `docs/changelog.md` was appended.
7. The commit hash.

## Read First
- `src/app/(main)/page.tsx`
- `src/app/(main)/discovery/page.tsx`
- `src/app/(main)/tags/page.tsx`
- `src/app/api/right-rail/route.ts`
- Next.js docs reference: `unstable_cache` from `next/cache` (already used elsewhere in the codebase if you want a precedent — check before importing fresh).

## Do NOT
- Do NOT cache any query whose result depends on `user.id` or auth cookies. If unsure, leave it uncached.
- Do NOT change the SQL queries themselves. No new joins, no new `.in()` filters, no removed fields. Caching ONLY.
- Do NOT add Postgres functions, RPCs, materialized views, or new columns. That is Layer 2.
- Do NOT introduce `revalidatePath` / `revalidateTag` calls in mutation routes (likes/bookmarks/follows). The current 60–300s TTL is acceptable staleness for trending data; we'll add tag-based invalidation later if it actually matters.
- Do NOT touch `articles` or `sources` table schema.
- Do NOT touch UI components.
- Do NOT skip the before/after measurement. Numbers are the deliverable, not just the code.
