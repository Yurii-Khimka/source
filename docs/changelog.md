# SORCE — Changelog

## 2026-05-03 — perf(cache): wrap public DB reads in unstable_cache; cache right-rail API
Layer-1 cost reduction. Wrapped all heavy, public (non-user-specific) DB reads in `unstable_cache`.
Per-user queries (likes, bookmarks, follows, mutes) left dynamic.

| Route           | Before cold | Before warm | After cold | After warm | Change (warm) |
|-----------------|-------------|-------------|------------|------------|---------------|
| /               | 7.28s       | 2.07s       | 2.60s      | 0.09s      | -96%          |
| /discovery      | 5.28s       | 3.27s       | 0.92s      | 0.02s      | -99%          |
| /tags           | 1.16s       | 0.25s       | 0.04s      | 0.004s     | -98%          |
| /api/right-rail | 0.84s       | 0.59s       | 0.52s      | 0.43s      | -27%          |

Layer-2 (RPC aggregates + scoped queries) deferred pending real-world measurement.

## 2026-05-02 — feat(tags): round 2 vocabulary expansion (regional UA, weather, crime, sport, culture)
- Untagged: 1232 / 14.8% → 631 / 7.6% (target was < 9%).
- 605 newly tagged, 1214 re-tagged (set diff), 0 lost all tags.
- Per-tag totals after re-tag:
  economy: 826, politics: 1713, conflict: 2430, investigation: 229, europe: 1138,
  ukraine: 3323, world: 3177, tech: 224, climate: 344, sport: 611, culture: 504, society: 1279.
- Delta vs previous: ukraine +679, world +195, politics +18, europe +58, society +721, culture +182, sport +72, climate +112, conflict +80, economy +5, tech +3.
- Clusters addressed: Ukrainian regional oblast names, weather/синоптик vocabulary, crime/courts/police, NHS/health, niche sports (marathon/snooker/chess/fencing/golf/WNBA), celebrity/entertainment names, strikes/layoffs, Pope Leo, Central Asia + African nations, Balkan/Swiss/Moldovan countries.

## 2026-05-02 — feat(tags): expand keyword vocabulary; add inspector mode
- Massively expanded `src/lib/tag-keywords.json`: US/UK/EU political vocab, world leaders, country names, sports leagues/clubs/athletes, tech companies, cultural events.
- Untagged articles: 2075 (25%) → 1230 (14.9%).
- Per-tag totals after re-tag:
  economy: 821, politics: 1695, conflict: 2350, investigation: 238, europe: 1080,
  ukraine: 2644, world: 2982, tech: 221, climate: 232, sport: 539, culture: 322, society: 558.
- Added `--inspect` mode to `retag_all.py` to diagnose remaining untagged articles.
- Removed `general` tag from DB (no longer referenced).

## 2026-05-02 — feat(tags): scored synonym matcher + retag all articles
- New single source of truth: `src/lib/tag-keywords.json` (12 tags with strong/normal/negative keywords).
- Replaced naive `text.includes(kw)` with scored word-boundary matcher (Unicode-aware regex, title×3 weighting, per-keyword cap of 6, threshold ≥3, top-3 cap).
- Added 3 new tags: `sport`, `culture`, `society`.
- Dropped `general` fallback — articles with no high-confidence match remain untagged.
- TS (`src/lib/tag-keywords.ts`) and Python (`scripts/fetcher.py`) both read from the same JSON.
- Re-tagged all 8211 existing articles via `scripts/retag_all.py`:
  - re-tagged (set diff): 4671
  - lost all tags (previously general-only): 2075
  - unchanged: 1465
- Deleted old `scripts/backfill_tags.py`.

## 2026-05-02 — fix: revert right-rail Support to direct link; rework mobile profile Support placement
Right-rail Support widget reverted to direct Donatello link (`target="_blank"`). Mobile profile: removed standalone Support section, added full-width Donate CTA below identity block, moved `/support` menu row into Info section between About and Trust Standards.

## 2026-05-02 — feat: add /support page and route Support entries through it
New `/support` donations explainer page mirroring About layout. Right-rail widget and mobile profile Support row now link to `/support` instead of Donatello directly. Added Support link to right-rail footer. Donate button on the page links out to Donatello.

## 2026-05-02 — fix: home Discover button now has hover
Added `className="btn-primary"` to the Discover `<a>` on the empty-feed home page. Rescanned all `.tsx` files — no other accent-background buttons missing a hover class.

## 2026-05-02 — fix: btn-primary hover now clearly visible in both themes
Bumped `--hover-btn-primary` in dark theme from `rgb(85,89,220)` to `rgb(129,133,255)` (matches `--accent-hi`). Added subtle `box-shadow: 0 0 0 2px var(--accent-dim)` ring on hover for extra perceptual lift. Light theme unchanged (already correct).

## 2026-05-02 — feat: support entry on mobile profile + hover audit
Added Support menu row (Heart icon, Donatello link) to mobile profile tab, placed above "Your content". Audited interactive elements in 6 files — all already covered by hover classes; no changes needed.

## 2026-05-02 — init: add plan.md, changelog.md, and chat.md workflow files
Created three workflow files under docs/. plan.md is overwritten by chat each task; changelog.md is appended by CC after each task; chat.md holds Tech Lead instructions and is never read by CC.
