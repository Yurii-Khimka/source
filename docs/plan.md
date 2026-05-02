# SORCE — Current Plan
_Updated by Claude Chat before each task._

## Status
**Active task:** Create the `/support` page (donations explainer) and re-route the existing Support buttons through it.

## Context
- Reference page (style + structure): `src/app/(main)/about/page.tsx`. Match its container, typography, section labels, paragraph style, and card style EXACTLY.
- New page route: `src/app/(main)/support/page.tsx`.
- Donate URL: `https://donatello.to/thesource` — opens in new tab from the page's CTA button.
- The two existing entry points must now link to `/support` (not directly to Donatello):
  - Right rail top widget: `src/components/right-rail.tsx` (Widget 0 — currently `<a href="https://donatello.to/thesource" target="_blank" ...>`).
  - Mobile profile menu: `src/app/(main)/profile/mobile/page.tsx` (currently a `<MenuRow href="https://donatello.to/thesource" ... external />`).
- The footer link strip in `src/components/right-rail.tsx` (line 193) must include a new `/support` link.

## Current Task

### Part A — Create `src/app/(main)/support/page.tsx`
Mirror the structure of `src/app/(main)/about/page.tsx`. Use the SAME imports, the SAME constants (`mono`, `serif`, `sectionLabel`, `paragraph`), the SAME container, and the SAME card pattern. Do NOT introduce new style constants.

Page structure (from top to bottom):

1. Container: `<div className="page-content" style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>`
2. `<BackButton />` at top.
3. H1 (serif, 32px, weight 400, `dark.text`): **Support The Source**
4. Intro paragraph (use `paragraph` style, `marginTop: 16`):
   > The Source has no ads. No investors. No agenda. It is funded entirely by readers who believe in honest journalism. If this platform is useful to you, consider supporting it.
5. Section "Where your money goes" — `sectionLabel` + a vertical stack (`gap: 10`) of 4 cards. Each card uses the SAME wrapper as the philosophy cards in About (`background: dark.surface, border: 1px solid dark.line, padding: 16px 20px`). Each card has a title (14px, weight 500, `dark.text`, marginBottom 6) and a body (13px, `dark.textSub`, lineHeight 1.6).
   - **Infrastructure** — Domain, hosting, and servers. The Source runs lean — every article you read costs real money to deliver. Your support keeps it online.
   - **Source subscriptions** — Some of the best journalism is behind paywalls. We plan to subscribe to premium sources on behalf of our readers — so you get access to quality reporting without paying individually for each outlet.
   - **AI tools** — We use AI to help moderate content and improve the platform. We believe in disclosing this openly — AI is a tool, not a replacement for editorial judgement.
   - **Development** — Building and maintaining The Source takes time. Contributions help us improve faster and fix things sooner.
6. Section "Our promise" — `sectionLabel` + two paragraphs (use `paragraph` style; second paragraph has `marginTop: 12`):
   > We will publish a simple, honest breakdown of how donations are spent — no vague "operational costs", no hidden salaries. If you give, you will know exactly where it went.

   > We will never accept money from media companies, political organisations, or advertisers. Independence is not negotiable.
7. Section "How to support" — `sectionLabel` + one paragraph + Donate button.

   Paragraph (use `paragraph` style):
   > Every contribution helps. There is no minimum. Thank you.

   Donate button — render an `<a>` styled like the signup/signin primary button. Use `className="btn-primary"`. Inline style:
   ```tsx
   <a
     href="https://donatello.to/thesource"
     target="_blank"
     rel="noopener noreferrer"
     className="btn-primary"
     style={{
       display: "inline-flex",
       alignItems: "center",
       gap: 8,
       marginTop: 16,
       padding: "10px 24px",
       borderRadius: 6,
       background: dark.accent,
       color: "var(--on-accent)",
       fontFamily: sans,  // see note
       fontSize: 14,
       fontWeight: 600,
       textDecoration: "none",
     }}
   >
     <Heart size={14} />
     Donate
   </a>
   ```
   - Add `import { Heart } from "lucide-react";` at the top of the file.
   - About uses only `mono` and `serif` constants — for the donate button's body text font, also define a local `sans` constant identical to other pages: `const sans = "'Inter', system-ui, sans-serif";` at the top with the existing constants. Do NOT change About.

### Part B — Re-route the right-rail Support widget
In `src/components/right-rail.tsx`, change the Widget 0 anchor:
- Replace `<a href="https://donatello.to/thesource" target="_blank" rel="noopener noreferrer" ...>` with `<Link href="/support" ...>` (use the existing `Link` import from `next/link`).
- Remove `target` and `rel` attributes (internal link).
- Keep ALL inline styles and the `className="btn-outline"` exactly as they are.
- Keep label "Support" and the `<Heart>` icon.

### Part C — Re-route the mobile profile Support row
In `src/app/(main)/profile/mobile/page.tsx`, change the Support `MenuRow`:
- FROM: `<MenuRow href="https://donatello.to/thesource" icon={Heart} label="Support The Source" external />`
- TO:   `<MenuRow href="/support" icon={Heart} label="Support The Source" />`
- Remove the `external` prop.

### Part D — Add `/support` to the right-rail footer
In `src/components/right-rail.tsx`, line 193 (the footer link strip), add a new link to `/support` labeled `Support`. Insert it as the FIRST link in the strip (before "About"), matching the existing `<Link className="footer-link" ...>` pattern.

### Part E — Verify and ship
1. Run `npm run lint`.
2. Visit `/support` in the browser. Confirm:
   - Layout matches About visually (max-width, paragraph spacing, card style).
   - The Donate button hovers correctly (lighter accent + ring) — this validates the prior `.btn-primary` hover fix.
   - Right-rail Support widget now navigates to `/support` (not Donatello).
   - Mobile profile Support row now navigates to `/support`.
3. Run:
   ```
   python3 scripts/update_session.py --completed "support page" --note "New /support explainer page (About-style); right rail + mobile profile + footer all route through it; donate button on page links to Donatello"
   ```
4. Append a `2026-05-02` entry to `docs/changelog.md`.
5. Commit with message: `feat: add /support page and route Support entries through it`

## Output
Reply with:
1. Diff for the new `src/app/(main)/support/page.tsx` (full file in one fenced block).
2. Diffs for: `src/components/right-rail.tsx` and `src/app/(main)/profile/mobile/page.tsx`.
3. Confirmation lint passed and the page was visually verified (or say if you couldn't run a browser).
4. Confirmation `update_session.py` ran AND `docs/changelog.md` was appended.
5. The commit hash.

## Read First
- `src/app/(main)/about/page.tsx` — STYLE REFERENCE; mirror exactly.
- `src/components/right-rail.tsx`
- `src/app/(main)/profile/mobile/page.tsx`

## Do NOT
- Do NOT introduce new style constants beyond `sans` (and only on the new page).
- Do NOT add a card icon. About cards have no icons; the support cards must match.
- Do NOT change the About page.
- Do NOT change the desktop right-rail Support widget's `className="btn-outline"` or its inline styles — only the `href` and link element type.
- Do NOT skip the changelog append.
