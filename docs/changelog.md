# SORCE — Changelog

## 2026-05-02 — fix: home Discover button now has hover
Added `className="btn-primary"` to the Discover `<a>` on the empty-feed home page. Rescanned all `.tsx` files — no other accent-background buttons missing a hover class.

## 2026-05-02 — fix: btn-primary hover now clearly visible in both themes
Bumped `--hover-btn-primary` in dark theme from `rgb(85,89,220)` to `rgb(129,133,255)` (matches `--accent-hi`). Added subtle `box-shadow: 0 0 0 2px var(--accent-dim)` ring on hover for extra perceptual lift. Light theme unchanged (already correct).

## 2026-05-02 — feat: support entry on mobile profile + hover audit
Added Support menu row (Heart icon, Donatello link) to mobile profile tab, placed above "Your content". Audited interactive elements in 6 files — all already covered by hover classes; no changes needed.

## 2026-05-02 — init: add plan.md, changelog.md, and chat.md workflow files
Created three workflow files under docs/. plan.md is overwritten by chat each task; changelog.md is appended by CC after each task; chat.md holds Tech Lead instructions and is never read by CC.
