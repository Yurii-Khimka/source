# SORCE — Current Plan
_Updated by Claude Chat before each task._

## Status
**Active task:** Three small fixes — revert the right-rail Support widget to a direct Donatello link, move the mobile profile's `/support` menu row, and add a Donate CTA button on the mobile profile.

## Context
- Donatello URL: `https://donatello.to/thesource` — opens in a new tab.
- The desktop right-rail Support widget was changed in the previous task to link to `/support`. The owner wants it back to a direct external Donatello link.
- The `/support` page itself is staying. It remains reachable via the right-rail footer strip and via the mobile profile menu (after this task).
- Current mobile profile structure (`src/app/(main)/profile/mobile/page.tsx`):
  1. User identity block
  2. Divider + `Support` section + `<MenuRow href="/support" icon={Heart} ...>` ← will MOVE
  3. Divider + `Your content` section
  4. Divider + `Info` section: Feedback, About, Trust, Privacy, Terms, GitHub
  5. (logged-in only) Account section

## Current Task

### Part A — Revert right-rail Support widget to direct Donatello link
In `src/components/right-rail.tsx`, Widget 0 (the "SUPPORT" card at the top):
- Change the inner `<Link href="/support" ...>` element back to an `<a>` element.
- `href="https://donatello.to/thesource"`
- Add `target="_blank"` and `rel="noopener noreferrer"`.
- Keep the `className="btn-outline"`, all inline styles, the `<Heart size={13} />` icon, and the label `Support` exactly as they are now.

### Part B — Mobile profile: move `/support` menu row into the Info section
In `src/app/(main)/profile/mobile/page.tsx`:
1. REMOVE the standalone block that currently sits between the user identity and "Your content":
   ```tsx
   <div style={dividerStyle} />
   <SectionLabel>Support</SectionLabel>
   <MenuRow href="/support" icon={Heart} label="Support The Source" />
   ```
   This means the divider + section label + menu row, all three.
2. INSIDE the existing `Info` section, ADD a new `MenuRow` for `/support` placed DIRECTLY AFTER the existing About row and BEFORE the Trust Standards row:
   ```tsx
   <MenuRow href="/about" icon={Info} label="About" />
   <MenuRow href="/support" icon={Heart} label="Support" />
   <MenuRow href="/trust" icon={ShieldCheck} label="Trust Standards" />
   ```
   Use label `Support` (shorter, matches sibling rows). Internal link — no `external`.

### Part C — Mobile profile: add a Donate CTA button below the profile
In `src/app/(main)/profile/mobile/page.tsx`, IMMEDIATELY AFTER the closing `</div>` of the user identity block (the `<div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>` block — currently followed by the divider that introduced the Support section), insert a Donate CTA button BEFORE the divider that begins the "Your content" section.

Render an `<a>` styled like the page's existing `Sign in` accent button (also a `btn-primary` accent CTA on this same page). Spec:

```tsx
<a
  href="https://donatello.to/thesource"
  target="_blank"
  rel="noopener noreferrer"
  className="btn-primary"
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    marginBottom: 24,
    padding: "12px 20px",
    borderRadius: 6,
    background: dark.accent,
    color: "var(--on-accent)",
    fontFamily: sans,
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
  }}
>
  <Heart size={15} />
  Support The Source
</a>
```

- `Heart` is already imported on this page (added in a prior task). Verify the import exists; if not, add it.
- The button must span full width of the content area (consistent with mobile CTAs).
- Place this button so the visual flow is: identity → Donate button → divider → Your content → ...

### Part D — Verify and ship
1. Run `npm run lint`.
2. Visual checks:
   - Desktop: right-rail Support button opens `donatello.to/thesource` in a new tab. The `/support` link in the footer still works.
   - Mobile: a full-width accent Donate button sits directly below the user identity. Tapping it opens Donatello in a new tab. The `/support` page is reachable from the Info section, between About and Trust Standards.
3. Run:
   ```
   python3 scripts/update_session.py --completed "rework support entry points" --note "Right rail Support reverted to direct Donatello link. Mobile profile: moved /support row into Info; added top Donate CTA"
   ```
4. Append a `2026-05-02` entry to `docs/changelog.md`.
5. Commit with message: `fix: revert right-rail Support to direct link; rework mobile profile Support placement`

## Output
Reply with:
1. Diff for `src/components/right-rail.tsx`.
2. Diff for `src/app/(main)/profile/mobile/page.tsx`.
3. Confirmation lint passed.
4. Confirmation `update_session.py` ran AND `docs/changelog.md` was appended.
5. The commit hash.

## Read First
- `src/components/right-rail.tsx`
- `src/app/(main)/profile/mobile/page.tsx`

## Do NOT
- Do NOT touch `src/app/(main)/support/page.tsx`.
- Do NOT remove the `/support` link from the right-rail footer strip.
- Do NOT change the right-rail Support widget's visual style (`btn-outline`, inline styles, icon, label) — only the link target/element.
- Do NOT introduce new style constants.
- Do NOT skip the changelog append.
