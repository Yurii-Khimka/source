# The Source — Session State
**Last updated:** 2026-04-24

## Production
- URL: https://srct.news
- Hosting: Vercel
- DB: Supabase

## Current Phase
Phase 1 — MVP in progress

## Completed
- [2026-04-22] DB schema + RLS policies
- [2026-04-22] Python RSS fetcher (8/12 sources)
- [2026-04-23] Next.js scaffold + Supabase connection
- [2026-04-23] Article card component
- [2026-04-23] App shell — header + sidebar
- [2026-04-23] Feed page — markets ticker, tabs, category pills
- [2026-04-23] Auth — Google OAuth + email/password
- [2026-04-23] Likes and bookmarks (functional)
- [2026-04-23] Follow/mute sources
- [2026-04-23] Search page
- [2026-04-23] Bookmarks page
- [2026-04-23] Settings page
- [2026-04-23] GitHub Actions cron job
- [2026-04-23] Vercel deployment + srct.news domain
- [2026-04-24] Header redesign matching design system
- [2026-04-24] Left sidebar redesign
- [2026-04-24] Right rail — integrity widget, trending sources
- [2026-04-24] Feed redesign — real tags, following default, markets ticker
- [2026-04-24] Like/bookmark active states
- [2026-04-24] Like counter RLS fix — SECURITY DEFINER function
- [2026-04-24] Bookmark counter real-time updates
- [2026-04-24] Hashtag support — tags on articles, tag page, tag filter pills
- [2026-04-24] Auto session state update script
- [2026-04-24] Hashtags widget in right rail (list style with counts)
- [2026-04-24] Hashtag display fix — keyword fallback for empty article_tags
- [2026-04-24] Fixed: Hashtags widget missing from right rail
- [2026-04-24] Hashtags widget — pill grid layout in right rail
- [2026-04-24] Sync hashtag pill style across article card and right rail
- [2026-04-24] Component consistency rules added to CLAUDE.md
- [2026-04-24] Fixed hashtag pill spec in CLAUDE.md — surface background
- [2026-04-24] Breadcrumb renamed from Your feed to Your timeline
- [2026-04-24] Infinite scroll on feed with live showing X of Y counter
- [2026-04-24] Sticky category bar with live showing counter
- [2026-04-24] Filter low-res images in RSS fetcher (min 400x200)
- [2026-04-24] Sticky category bar bottom spacing (16px)
- [2026-04-24] Sticky bar bottom spacing adjusted to 8px
- [2026-04-24] Blur background behind article images in card
- [2026-04-24] Article image object-fit cover — fill full card width
- [2026-04-24] Hide low-quality images in article card (min 400x200 natural)
- [2026-04-24] Restore blur background on article images
- [2026-04-24] Upgrade Guardian image URLs to high resolution in fetcher
- [2026-04-24] One-time script to backfill Guardian image URLs to high resolution
- [2026-04-24] Hide image container on load error in article card
- [2026-04-24] Guardian URL upgrade script rewritten with urllib.parse + dry-run
- [2026-04-24] Hide broken and low-res images in article card
- [2026-04-24] Image container only renders after silent load + size check pass
- [2026-04-24] Remove Following/All tabs — show only followed sources
- [2026-04-24] Discovery page
- [2026-04-24] Rebuild Discovery page
- [2026-04-24] Sidebar followed sources live update
- [2026-04-24] Fix trending tags query

## In Progress
- Article card design polish
- Hashtags widget in right rail
- Markets ticker border fix
- [2026-04-24] Added update_session.py and CLAUDE.md rule
- [2026-04-24] Right rail hashtags now match trending sources layout
- [2026-04-24] Built /discovery with sources grid, trending tags, search, tab filters, follow/unfollow toggle
- [2026-04-24] Sources grid with follower counts, trending tags table with rank/delta/24h, top stories with ArticleCard, underline tabs, search with clear button
- [2026-04-24] Added /api/followed-sources endpoint, SidebarNav listens for followChanged events, dispatched from Discovery and ArticleCard
- [2026-04-24] Fetch all tags from tags table, count 24h/48h via article_tags, show tags with 0 articles, keyword inference fallback

## Backlog (priority order)
1. Discovery page
2. Source page (article list by source)
3. About / Trust Standards page
4. Onboarding flow
5. Light theme toggle
6. Responsive / mobile layout
7. OG image extraction in fetcher
8. Feedback form
9. Donate button (Monobank jar — waiting for link)
10. Analytics (Plausible or GA4)
11. Missing RSS sources: hromadske, babel, kyivindependent, rferl

## Known Bugs
- Markets ticker border not full width
- Tab counter badge style inconsistent

## Sources
Working: ukrpravda, suspilne, skhemy, slidstvo, euronews, bbc, guardian, dw
Pending RSS URL: hromadske, babel, kyivindependent, rferl

## Tech Stack
Next.js 14 + Supabase + Python RSS fetcher
See CLAUDE.md for full permanent context.
