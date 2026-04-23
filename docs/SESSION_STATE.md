# SORCE — Session State

## Completed
- [x] Step 1: Scaffold Next.js project
- [x] Step 2: Supabase project setup + migrations
- [x] Step 3: RLS policies
- [x] Step 18: Python RSS fetcher

## Sources
- Working: ukrpravda, suspilne, skhemy, slidstvo, euronews, bbc, guardian, dw
- Pending RSS URL: hromadske, babel, kyivindependent, rferl

## In progress
- [x] Step 5: Design tokens + theme system (partial — dark theme only, no toggle yet)

## Not started
- [ ] Step 4: Auth (sign up / sign in)
- [x] Step 6: App shell (header + sidebar)
- [x] Step 7: Article card component
- [~] Step 8: Feed page (partial — no auth, no real follow/mute yet)
- [ ] Step 9: Tags
- [ ] Step 10: Follows
- [ ] Step 11: Mutes
- [ ] Step 12: Likes
- [ ] Step 13: Bookmarks
- [ ] Step 14: Admin panel
- [ ] Step 15: Moderation (AI)
- [ ] Step 16: KYC verification
- [ ] Step 17: Search
- [ ] Step 19: Multi-source RSS fetcher
- [ ] Step 20: Deployment

## 2026-04-23 Day 2
- App shell built with header, sidebar, dynamic sources list
- Design tokens implemented (dark theme)
- ArticleCard component built matching design system
- Lucide icons integrated
- Feed page: header, tabs, 100 articles, footer message
- Source logos added via Google Favicons
- logo_url column added to sources table
- Pending: auth, follow/mute logic, light theme toggle

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
- Add "Sign out" option in settings or header

## 2026-04-22 Day 1
- DB schema created and migrated
- RLS policies applied to all 9 tables
- RSS fetcher working for 8 sources: ukrpravda, suspilne, skhemy, slidstvo, euronews, bbc, guardian, dw
- 500+ articles in Supabase
- First Next.js page reading live data from Supabase
- Pending: hromadske, babel, kyivindependent, rferl RSS URLs not found
