# Colour contrast — WCAG 2.1 AA

Goal: every text/background pair ≥ 4.5:1, focus ring ≥ 3:1, in both themes,
without changing how the product looks.

## Result

| | `color-contrast` nodes failing (axe, 5 pages × 2 themes) |
|---|---|
| Before (`main`) | **421** |
| After (this branch) | **0** |

Per page (after): `/`, `/discovery`, `/following`, `/source/kyivdaily`,
`/tag/politics` — 0 in dark, 0 in light. Full reports:
[`before/axe-report.json`](before/axe-report.json),
[`after/axe-report.json`](after/axe-report.json).

Other axe rules that still fire (not contrast, unchanged by this PR, worth a
follow-up): `button-name` — icon-only buttons (like, bookmark, "…" menu,
header icons) have no accessible name.

Side-by-side screenshots: [`compare/`](compare/) (`<theme>-<page>.png`).

## Token changes (`src/app/globals.css`)

| Token | Theme | Before | After | Min. ratio now |
|---|---|---|---|---|
| `--accent-solid` *(new)* | both | — | `#5A5EE8` | 5.00 (white text) |
| `--accent-solid-hover` *(new)* | both | — | `#4F46E5` | 6.29 (white text) |
| `--accent-text` *(new)* | dark | — | `#8185FF` | 5.10 |
| `--accent-text` *(new)* | light | — | `#4F46E5` | 5.43 |
| `--hover-btn-primary` | both | `#8185FF` / `#4F46E5` | `var(--accent-solid-hover)` | 6.29 |
| `--text-mute` | dark | `#6C727E` | `#868C98` | 4.71 |
| `--text-mute` | light | `#9298A4` | `#666C78` | 4.55 |
| `--text-dim` | light | `#6C727E` | `#565C68` | 5.80 |
| `--danger` | light | `#F43F5E` | `#BE123C` | 5.42 |
| `--success` | light | `#33AA28` | `#23751C` | 4.99 |
| `--primary` (shadcn) | both | `var(--accent)` | `var(--accent-solid)` | — |
| `--ring` (shadcn) | both | `var(--accent)` | `var(--accent-text)` | — |

`--accent` is unchanged and is now used only for borders, underlines, tints
and decoration.

New TS tokens in `src/lib/tokens.ts`: `accentSolid`, `accentSolidHover`,
`accentText`.

## Components moved to the new tokens

- **Filled buttons → `accentSolid`**: Discover (empty feed), Follow
  (discovery, source, tag), Sign in / Sign up, mobile profile Sign in, Feedback
  submit, Support, onboarding Continue, theme toggle, error / 404 pages.
- **Accent text & indicators → `accentText`**: active filter chips, active
  tab in the bottom bar, liked / bookmarked icons and counts, verified
  badges, "Following" button text, text links, settings accent labels,
  onboarding check marks.

## Focus

One global `:focus-visible` rule for `a`, `button`, `input`, `select`,
`textarea`, `summary`, `[role=button|tab|menuitem]` and focusable
`[tabindex]`: `2px solid var(--accent-text)`, offset 2px. It replaces five
copies of the same rule on single classes. `--accent-text` is ≥ 5.1:1 on
every background, well above the 3:1 needed for non-text contrast.

## Beyond the original list

Source avatars with initials (white text on a colour chosen from the handle)
were 1.99–3.80:1. The palette is hard-coded in five files (not tokens). Each
colour was darkened in HSL — same hue and saturation — until white text
reaches ≥ 4.6:1:

| Before | After | | Before | After |
|---|---|---|---|---|
| `#e0b14f` | `#956d1a` | | `#44bd8f` | `#2e8262` |
| `#ee6c4d` | `#d73a15` | | `#cf6a87` | `#c4496d` |
| `#5b8fb9` | `#4679a3` | | `#4a9ec5` | `#327b9d` |
| `#9c6ade` | `#9057da` | | `#d4845a` | `#b35c2f` |

`#3d5a80`, `#7b6bb5` and the grey fallback `#6C727E` already passed.

## How to re-run

```bash
# 1. Token pairs (fails with exit 1 if anything < 4.5:1, focus ring < 3:1)
node scripts/a11y/check-contrast.mjs

# 2. axe + screenshots against a local mock of Supabase
node scripts/a11y/mock-supabase.mjs &               # :54321, fictional seed data
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon-key npx next dev -p 3001 &
BASE_URL=http://localhost:3001 OUT=docs/a11y/after \
AXE_PATH=/path/to/axe-core/axe.min.js node scripts/a11y/audit.mjs
```

`audit.mjs` needs `playwright` and `axe-core` (`npm i -g axe-core` or pass
`AXE_PATH`). Neither is added to `package.json`. The mock signs in a fake user
so `/following` and the follow/like states render. Source logos come from an
external favicon service, so the mock sets `site_url: null` and the
initials avatars show instead.
