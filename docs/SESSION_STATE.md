# The Source — Session State

## Completed
- [x] Step 1: Scaffold Next.js project
- [x] Step 2: Supabase project setup + migrations
- [x] Step 3: RLS policies
- [x] Step 4: Supabase Auth (email + password + Google OAuth)
- [x] Step 5: Design tokens + theme system (dark theme)
- [x] Step 6: App shell (header + sidebar)
- [x] Step 7: Article card component
- [x] Step 8: Feed page (with follow/mute + following tab)
- [x] Step 10: Follows (functional)
- [x] Step 11: Mutes (functional)
- [x] Step 12: Likes (functional)
- [x] Step 13: Bookmarks (functional + page)
- [x] Step 17: Search
- [x] Step 18: Python RSS fetcher
- [~] Step 14: Settings page (partial — no light theme yet)
- [x] Step 19: GitHub Actions cron job
- [x] Step 20: Deployment (Vercel + custom domain srct.news)

## Production
- URL: https://srct.news

## Sources
- Working: ukrpravda, suspilne, skhemy, slidstvo, euronews, bbc, guardian, dw
- Pending RSS URL: hromadske, babel, kyivindependent, rferl

## Not started
- [ ] Step 9: Tags
- [ ] Step 15: Moderation (AI)
- [ ] Step 16: KYC verification
- [ ] Step 19: Multi-source RSS fetcher

## 2026-04-24 Day 3
- Header rebuilt matching design system (3-col grid, logo, breadcrumbs, icon buttons)
- Left sidebar rebuilt — nav group (Home, Discovery, Following, Tags, Bookmarks), followed sources, bookmark counter
- Right rail added — integrity widget, trending sources, recent hashtags, footer
- Feed redesign — markets ticker, tabs with counts, category pills from real tags
- Real tags from DB in feed filter pills (top 8 by article count)
- Following tab active by default when logged in
- Like/bookmark active states redesigned (accent container when active)
- Like/bookmark toggle bug fixed (delete by user_id+article_id, error handling)
- Tab counter badges styled to match sidebar badge pattern
- Markets ticker border spans full card width
- Bell (notifications) icon removed from header (post-MVP)
- Analytics tracking added to backlog

### In progress / known issues
- Hashtags widget data depends on article_tags being populated
- Category pill filtering is UI-only (no article categories in DB yet)
- Markets ticker data is static placeholder
- Light theme still not implemented

## 2026-04-23 Day 2
- App shell built with header, sidebar, dynamic sources list
- Design tokens implemented (dark theme)
- ArticleCard component built matching design system
- Lucide icons integrated
- Feed page: header, tabs, 100 articles, footer message
- Source logos added via Google Favicons
- logo_url column added to sources table
- Auth working: Google OAuth + email/password
- Auto profile creation on signup via DB trigger
- User avatar shown in header
- Likes and bookmarks functional for logged in users
- Fetcher watch script for local dev
- Follow/mute sources working
- Following tab functional
- Search page working
- Bookmarks page working
- Settings page: account, follows, mutes, theme placeholder, sign out

## Dev workflow
- Start dev server: npm run dev
- Start fetcher watcher: cd scripts && ./watch.sh
- Both run in separate terminal tabs

## Backlog

### Auth UX improvements (post-MVP polish)
- Email confirmation flow — better redirect and success message
- Sign up form — show password strength indicator
- Sign in — show error message when credentials are wrong
- After Google sign in — redirect back to the page user was on

### Feedback form
- Simple feedback form accessible from Settings page or footer
- Fields: message (textarea), optional email
- Submits to a Supabase table or email
- No auth required — anyone can submit feedback

### Donate button
- Monobank Банка link in sidebar bottom
- Same link on About / Trust Standards page
- Text: "Support The Source"
- Wait for Monobank jar link from owner before implementing

### Responsive / Mobile design
- Mobile breakpoint: 375px (iPhone)
- Tablet breakpoint: 768px (iPad)
- Sidebar collapses to bottom navigation on mobile
- Article cards full width on mobile
- Header simplified on mobile
- Do after design polish pass on Monday

### Analytics & Tracking
- Google Analytics 4 — page views, user behaviour
- Google Tag Manager — manage all tracking in one place
- Consider privacy-friendly alternative: Plausible or Umami
  (no cookies, GDPR compliant, open source)
- Decision needed: GA4 vs privacy-first analytics
- Implement after launch when real users are on the site

### Other
- OG image extraction in fetcher (articles need real thumbnails)
- Light theme implementation
- Design polish pass (after Monday Claude Design update)
- Onboarding flow (pick sources after sign up)
- About / Trust Standards page
- Mobile responsive layout

## 2026-04-22 Day 1
- DB schema created and migrated
- RLS policies applied to all 9 tables
- RSS fetcher working for 8 sources: ukrpravda, suspilne, skhemy, slidstvo, euronews, bbc, guardian, dw
- 500+ articles in Supabase
- First Next.js page reading live data from Supabase
- Pending: hromadske, babel, kyivindependent, rferl RSS URLs not found
