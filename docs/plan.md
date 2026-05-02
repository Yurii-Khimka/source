# SORCE — Current Plan
_Updated by Claude Chat before each task._

## Status
**Active task:** Fix missing hover on the home-page "Discover" button (shown to users with no follows / unauthorized users on home).

## Context
- File to edit: `src/components/feed.tsx`.
- The Discover button at lines 310–326 is rendered as a plain `<a href="/discovery">` styled inline to look like a primary button (background `dark.accent`, white text, 8px/20px padding, radius 6).
- It has NO `className`, so the global `.btn-primary:hover` rule in `src/app/globals.css` never matches → no hover.
- Root cause: missing class. Other primary-styled buttons in the codebase (`auth/signin`, `auth/signup`, `profile/mobile`) all use `className="btn-primary"` and hover correctly.
- This file was not in the previous hover audit's scope — that's why it slipped through.

## Current Task

### Part A — Fix
In `src/components/feed.tsx`, on the `<a href="/discovery">` element starting at line 310, add `className="btn-primary"`. Keep all existing inline styles. Do NOT change the styles, padding, color, or text.

The element should look like:
```tsx
<a
  href="/discovery"
  className="btn-primary"
  style={{
    display: "inline-block",
    marginTop: 20,
    padding: "8px 20px",
    borderRadius: 6,
    background: dark.accent,
    color: "var(--on-accent)",
    fontFamily: sans,
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
  }}
>
  Discover
</a>
```

### Part B — Quick rescan
Grep `src/` for any other interactive elements (`<button` or `<a` with `href`/`onClick`) that use `background: dark.accent` (or other accent fills) inline but DO NOT have a hover-bearing class (`btn-primary`, `btn-outline`, `btn-following`, `icon-btn`, `tag-pill`, `source-row`, `footer-link`, `right-rail-tag`).

Scope: all `.tsx` files under `src/`. Only ADD the missing class — do NOT change colors, sizes, or text. If an element is ambiguous (e.g. uses accent only as a border, not background), leave it and list it in the report.

### Part C — Verify and ship
1. Run `npm run lint`.
2. Open `/` while signed out (or with no follows) and hover the Discover button — confirm it now lifts to the brighter accent on hover.
3. Run:
   ```
   python3 scripts/update_session.py --completed "fix Discover button hover" --note "Added btn-primary class to home-page Discover button + rescan for other accent buttons missing hover class"
   ```
4. Append a `2026-05-02` entry to `docs/changelog.md`.
5. Commit with message: `fix: home Discover button now has hover (missing btn-primary class)`

## Output
Reply with:
1. Diff applied to `src/components/feed.tsx`.
2. Diffs for any other files updated in Part B (one fenced block each).
3. A bullet list RESCAN REPORT — files checked, elements fixed, ambiguous elements left alone.
4. Confirmation lint passed and the Discover button hover was visually verified (or say if you couldn't run a browser).
5. Confirmation `update_session.py` ran AND `docs/changelog.md` was appended.
6. The commit hash.

## Read First
- `src/components/feed.tsx` (around lines 300–330)
- `src/app/globals.css` (for the list of hover-bearing classes)

## Do NOT
- Do NOT change the visual style of the Discover button — only add the className.
- Do NOT add new CSS or new classes.
- Do NOT change a button's variant during the rescan. Only add a missing hover-bearing class where the inline styles already match a known variant.
- Do NOT skip the changelog append.
