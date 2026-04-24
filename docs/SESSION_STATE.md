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
- [2026-04-24] Remove Posts tab from Discovery
- [2026-04-24] Keyword fallback tagging for Ukrainian articles
- [2026-04-24] Post-run validation checks in fetcher
- [2026-04-24] Backfill tags on existing articles
- [2026-04-24] Fix Discovery placeholder + tags counter
- [2026-04-24] Add posts sections to Discovery tabs, fix All tab order
- [2026-04-24] Expand Ukrainian keyword matching, re-backfill untagged articles
- [2026-04-24] Assign General fallback tag to all untagged articles
- [2026-04-24] Fix root cause of untagged articles
- [2026-04-24] Move hashtags below post image in article card
- [2026-04-24] Remove divider below tags in post card
- [2026-04-24] Full-width divider in post card
- [2026-04-24] Fix Vercel build failure
- [2026-04-24] Build Source profile page
- [2026-04-24] Fix source profile navigation
- [2026-04-24] Fix source profile 404
- [2026-04-24] Replace Official Source pill with source link
- [2026-04-24] Source profile page MVP rebuild
- [2026-04-24] Move action block to right rail
- [2026-04-24] Sync follow/mute state between action block and article cards
- [2026-04-24] Smaller right rail buttons on source page
- [2026-04-24] Source link in same row as handle/followers
- [2026-04-24] Source logo on profile page
- [2026-04-24] Source link first in meta row
- [2026-04-24] Tag page
- [2026-04-24] Global links audit
- [2026-04-24] Remove Tags nav item from left rail
- [2026-04-24] Input hover and focus states
- [2026-04-24] Following page
- [2026-04-24] Loading states — skeletons and micro-spinners
- [2026-04-24] Fix full page reload on navigation
- [2026-04-24] Fix Vercel build failure
- [2026-04-24] Fix followed tags left rail update
- [2026-04-24] Fix tag page articles and skeleton
- [2026-04-24] Tag page — top sources table, counter fix, remove tabs
- [2026-04-24] Source logos in Top Sources table on tag page
- [2026-04-24] Fix untagged articles
- [2026-04-24] Trust Standards page
- [2026-04-24] Trust page content centred
- [2026-04-24] About page
- [2026-04-24] Terms and Privacy pages + GitHub footer link
- [2026-04-24] 404 and 502 error pages
- [2026-04-24] Onboarding flow
- [2026-04-24] Fix onboarding button alignment
- [2026-04-24] Hover and click states audit
- [2026-04-24] Fix onboarding button text wrap
- [2026-04-24] Mobile responsive layout
- [2026-04-24] Remove notification bell from mobile header

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
- [2026-04-24] Removed Posts tab, TOP STORIES section, articles query, and related props — Discovery now has All, Sources, Tags only
- [2026-04-24] Added TAG_KEYWORDS dict with Ukrainian+English keywords, infer_tags function, assign_tags function, RSS category check then keyword fallback in fetcher
- [2026-04-24] Added validate() — checks untagged articles, missing source_id, inactive sources (24h), total tags count, logs WARN or OK
- [2026-04-24] Created backfill_tags.py, seeded 9 tags, tagged 605/1000 articles (1048 assignments). Fixed tags table column name→label across frontend queries and fetcher.
- [2026-04-24] Fixed unicode escape in search placeholder, tags now show total article count (not just 24h), sorted by 24h trending then total
- [2026-04-24] Added ALL POSTS section to All tab (after sources+tags), POSTS FROM THESE SOURCES to Sources tab, RECENT POSTS to Tags tab. Fetches recent 20 articles with tags and user interactions. Reuses ArticleCard component.
- [2026-04-24] Added 40+ Ukrainian keywords across conflict/politics/ukraine/world/economy tags. Fixed backfill pagination bug (1000-row limit). Re-ran backfill: 1037/1355 articles now tagged (76.5%), up from 577.
- [2026-04-24] Added general fallback in infer_tags(), backfill second pass assigns general to still-untagged articles. 1037 specific + 318 general = 1355 total, 0 untagged.
- [2026-04-24] Three root causes: (1) backfill used get_tags_from_text() instead of infer_tags(), missing the general fallback; (2) backfill filtered is_hidden=False, skipping hidden articles; (3) second pass reused filtered list. Fixed all three.
- [2026-04-24] Swapped Tags and Image sections in article-card.tsx. New order: Title → Description → Image → Tags → Footer.
- [2026-04-24] Removed borderTop and paddingTop from footer row in article-card.tsx.
- [2026-04-24] Added full-width divider using negative margins to span past card padding.
- [2026-04-24] ESLint prefer-const error: articleTagsMap in discovery/page.tsx was declared with let but never reassigned. Changed to const.
- [2026-04-24] Created /source/[handle] with identity header, stats strip, transparency record, 3 tabs (Posts with infinite scroll, Audit Log empty state, About cards), actions dropdown, and source_id filter on articles API
- [2026-04-24] Fixed /source/[handle] routing, article card source links, right rail trending sources, Verified Sources view profile link. Full codebase audit completed.
- [2026-04-24] Removed non-existent description column from sources query that caused Supabase error and 404 on /source/[handle]
- [2026-04-24] Replaced Official Source pill with site_url link pill in source profile header
- [2026-04-24] Removed tabs, dashboard, crypto. Added Follow/Mute action block. Reused feed category pills and post counter.
- [2026-04-24] Moved Follow/Mute action block to right rail via Shell rightRailTop slot. Created SourceActionBlock client component. Cleaned source-profile-client of follow/mute handlers.
- [2026-04-24] Added sourceFollowChanged/sourceMuteChanged custom events to sync follow/mute state bidirectionally between SourceActionBlock and ArticleCard
- [2026-04-24] Reduced button padding 10→7px, fontSize 13→12, icon size 15→13, borderRadius 6→5, gap 8→6
- [2026-04-24] Merged site_url link into the @handle · followers · est. row with dot separator
- [2026-04-24] Show logo_url image instead of initials avatar when available, with fallback to initials
- [2026-04-24] Moved site_url link before @handle in the meta info row
- [2026-04-24] Built /tag/[slug] mirroring source profile structure. Top sources ranked by post count. Follow/mute action block in right rail. Verified mute tag logic applied to feed query.
- [2026-04-24] Fixed all unlinked source logos, source names, and tag pills across the entire codebase. Discovery Verified Sources fixed. Full audit completed.
- [2026-04-24] Removed top-level Tags menu item from left sidebar.
- [2026-04-24] Added .input-field CSS class with hover (brighter border) and focus (accent border + subtle accent bg). Applied to all 7 inputs: discovery search, article search, signin email/password, signup email/password/confirm.
- [2026-04-24] Built /following with Sources and Tags tabs, unfollow actions, empty states.
- [2026-04-24] Skeleton primitive + composite skeletons applied to all pages. Micro-spinner on like, bookmark, follow, mute, unfollow buttons.
- [2026-04-24] Replaced all internal anchor tags with Link. Verified shell in layout.tsx. Converted sidebars to client components with SWR cache. Right rail no longer remounts on navigation.
- [2026-04-24] Removed unused bookmarkCount and followedSources variables in shell.tsx.
- [2026-04-24] Fixed follow tag write, left rail query, and live update event so followed tags appear immediately without page reload.
- [2026-04-24] Fixed articles query join path (article_tags → tags), fixed skeleton/empty state mutual exclusion.
- [2026-04-24] Top sources now reuses Trending Tags component. Fixed post count inconsistency between Discovery and tag pages. Removed category tabs, added Recent posts label.
- [2026-04-24] Added logoUrl support to RankedTable component. Tag page Top Sources now shows source logos with initials fallback.
- [2026-04-24] Added general fallback to TypeScript inferTags. Fixed articles API tag filter to use inner join instead of .in() with 1000-row limit.
- [2026-04-24] Built /trust with intro, 4 criteria cards, dynamic standards and community sections. Added Standards link to right rail footer.
- [2026-04-24] Wrapped trust page content in max-width 680px centred container.
- [2026-04-24] Built /about with intro, 3 philosophy cards, journey section. Added About link to right rail footer.
- [2026-04-24] Built /terms and /privacy with full content. GitHub link added to right rail footer. Privacy and Terms footer links now point to correct routes.
- [2026-04-24] Built not-found.tsx, error.tsx, global-error.tsx. Terminal aesthetic, no shell, fun copy.
- [2026-04-24] Built 4-step onboarding at /onboarding. Welcome, follow sources, follow tags, complete. Triggers on first login. Skip and empty feed state included.
- [2026-04-24] Fixed flex alignment on Continue, Back, and Skip buttons.
- [2026-04-24] Standardised hover, active, focus states for all buttons, links, nav items, cards, pills, and icon buttons across the entire app.
- [2026-04-24] Added white-space nowrap to all onboarding footer buttons.
- [2026-04-24] Added mobile layout at 768px breakpoint. Bottom tab bar (4 icons), mobile header, hidden sidebars, mobile profile page, adapted article card and all pages.
- [2026-04-24] Bell icon removed from mobile header for MVP.

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
