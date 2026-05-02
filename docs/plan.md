# SORCE — Current Plan
_Updated by Claude Chat before each task._

## Status
**Active task:** Make `.btn-primary` hover visible. The hover rule currently fires but the color shift is too small to perceive.

## Context
- File to edit: `src/app/globals.css`.
- The `.btn-primary:hover` rule at lines 149–151 sets `background: var(--hover-btn-primary) !important`. The variable is already defined per theme.
- Current values:
  - Dark: `--accent: rgb(100,104,240)` → `--hover-btn-primary: rgb(85,89,220)` (delta ≈ 15/channel — barely visible)
  - Light: `--accent: rgb(100,104,240)` → `--hover-btn-primary: rgb(79,70,229)` (slightly more visible but still subtle)
- The codebase already exposes a brighter accent variant: `--accent-hi: rgb(129,133,255)` (dark) and `rgb(79,70,229)` (light). This is the natural "lighter-on-hover" target for dark mode.
- All `.btn-primary` usages found: `src/app/global-error.tsx`, `src/app/error.tsx`, `src/app/(main)/feedback/page.tsx`, `src/app/(main)/profile/mobile/page.tsx`, `src/app/onboarding/page.tsx`, `src/app/(main)/source/[handle]/source-action-block.tsx` (follow button).

## Current Task

### Part A — Update `--hover-btn-primary` for both themes
In `src/app/globals.css`:

1. In the dark-theme `:root { ... }` block, change line 38:
   - FROM: `--hover-btn-primary: rgb(85, 89, 220);`
   - TO:   `--hover-btn-primary: rgb(129, 133, 255);` _(matches `--accent-hi` for dark — clearly lighter)_
2. In the `[data-theme="light"] { ... }` block, change line 94:
   - FROM: `--hover-btn-primary: rgb(79, 70, 229);`
   - TO:   `--hover-btn-primary: rgb(79, 70, 229);` _(no change — light theme already uses the darker accent-hi shade, which is correctly contrasted on light surface)_
   - **Note**: only update if the existing value is NOT already `rgb(79, 70, 229)`. Verify before editing. If it already matches, leave it.

### Part B — Verify the hover rule applies regardless of inline `background`
Confirm that the `.btn-primary:hover:not(:disabled) { background: var(--hover-btn-primary) !important; }` rule at line 149–151 already uses `!important`. It does — no change needed. This means inline `style={{ background: dark.accent }}` is correctly overridden on hover. Note this in your reply.

### Part C — Optional polish (only if trivial)
Add a subtle box-shadow on hover for extra perceptual lift. In `src/app/globals.css`, inside the existing `.btn-primary:hover:not(:disabled)` rule, add ONE line:
```
box-shadow: 0 0 0 2px var(--accent-dim);
```
Keep the existing `background` line. Do NOT add new selectors or new variables.

### Part D — Verify and ship
1. Run `npm run lint`.
2. Test in browser: visit `/auth/signin` (or any page with a `.btn-primary` button — e.g. mobile profile when signed out, or the feedback form). Hover the button and confirm the color clearly lightens. Test BOTH dark and light themes.
3. Run:
   ```
   python3 scripts/update_session.py --completed "btn-primary visible hover" --note "Bumped --hover-btn-primary in dark theme to accent-hi; added subtle accent-dim ring shadow on hover"
   ```
4. Append a `2026-05-02` entry to `docs/changelog.md`.
5. Commit with message: `fix: btn-primary hover now clearly visible in both themes`

## Output
Reply with:
1. The diff of `src/app/globals.css`.
2. Visual confirmation summary: "Hovered btn-primary on [page] in dark theme — clearly lighter. Hovered in light theme — clearly darker." If you cannot run a browser, say so explicitly.
3. Confirmation lint passed.
4. Confirmation `update_session.py` ran AND `docs/changelog.md` was appended.
5. The commit hash.

## Read First
- `src/app/globals.css` (lines 1–200)

## Do NOT
- Do NOT change `.btn-primary` in any way other than the hover rule + optional shadow.
- Do NOT change `--accent` itself (base color stays the same).
- Do NOT touch other button classes (`.btn-outline`, `.btn-following`, etc).
- Do NOT add a new CSS variable.
- Do NOT modify any TSX file in this task.
