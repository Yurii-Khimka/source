# SORCE — Session State

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

## Sources
- Working: ukrpravda, suspilne, skhemy, slidstvo, euronews, bbc, guardian, dw
- Pending RSS URL: hromadske, babel, kyivindependent, rferl

## Not started
- [ ] Step 9: Tags
- [ ] Step 15: Moderation (AI)
- [ ] Step 16: KYC verification
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
- Text: "Support SORCE"
- Wait for Monobank jar link from owner before implementing

### Other
- OG image extraction in fetcher (articles need real thumbnails)
- Light theme implementation
- Design polish pass (after Monday Claude Design update)
- Onboarding flow (pick sources after sign up)
- About / Trust Standards page
- GitHub Actions cron job
- Vercel deployment
- Mobile responsive layout

## 2026-04-22 Day 1
- DB schema created and migrated
- RLS policies applied to all 9 tables
- RSS fetcher working for 8 sources: ukrpravda, suspilne, skhemy, slidstvo, euronews, bbc, guardian, dw
- 500+ articles in Supabase
- First Next.js page reading live data from Supabase
- Pending: hromadske, babel, kyivindependent, rferl RSS URLs not found
