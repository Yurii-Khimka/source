#!/usr/bin/env node
/**
 * WCAG 2.1 contrast check for the design tokens in src/app/globals.css.
 *
 * Parses the `:root` (dark) and `[data-theme="light"]` blocks, then checks:
 *   - every text token × every page/surface background  ≥ 4.5:1
 *   - on-accent text on the solid accent button fills    ≥ 4.5:1
 *   - accent text on the tinted accent chip backgrounds  ≥ 4.5:1
 *   - focus ring (--accent-text) on every background     ≥ 3:1
 *
 * Exits with code 1 if any pair fails.  Usage: node scripts/a11y/check-contrast.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const css = readFileSync(path.join(root, "src/app/globals.css"), "utf8");

function block(selector) {
  const i = css.indexOf(selector + " {");
  if (i < 0) throw new Error(`selector not found: ${selector}`);
  const body = css.slice(i, css.indexOf("}", i));
  const vars = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}

function parseColor(v) {
  v = v.trim();
  let m;
  if ((m = v.match(/^#([0-9a-f]{6})$/i))) {
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
  }
  if ((m = v.match(/^rgba?\(([^)]+)\)$/i))) {
    const p = m[1].split(",").map((s) => parseFloat(s));
    return [p[0], p[1], p[2], p[3] ?? 1];
  }
  throw new Error(`cannot parse colour: ${v}`);
}

function resolve(vars, name, seen = new Set()) {
  const v = vars[name];
  if (v === undefined) throw new Error(`token missing: ${name}`);
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  if (ref) {
    if (seen.has(name)) throw new Error(`cycle at ${name}`);
    seen.add(name);
    return resolve(vars, ref[1], seen);
  }
  return parseColor(v);
}

/** Composite a (possibly translucent) colour over an opaque one. */
function over([r, g, b, a], [R, G, B]) {
  return [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1];
}

function lum([r, g, b]) {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const dark = block(":root");
const light = { ...dark, ...block('[data-theme="light"]') };

const BACKGROUNDS = ["--bg", "--bg-alt", "--surface", "--surface2", "--surface3"];
const TEXT = ["--text", "--text-sub", "--text-dim", "--text-mute", "--accent-text", "--danger", "--success"];
const TINTS = ["--accent-dim", "--accent-bg", "--hover-accent-dim"]; // active chip backgrounds
const TINT_BASES = ["--surface", "--bg"];

let failures = 0;
const rows = [];

function check(theme, label, fg, bg, min) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failures++;
  rows.push({ theme, label, ratio: r.toFixed(2), min, ok });
}

for (const [theme, vars] of [["dark", dark], ["light", light]]) {
  // 1. text tokens on backgrounds
  for (const t of TEXT) {
    for (const b of BACKGROUNDS) {
      check(theme, `${t} on ${b}`, resolve(vars, t), resolve(vars, b), 4.5);
    }
  }
  // 2. white text on solid accent fills
  for (const b of ["--accent-solid", "--accent-solid-hover", "--hover-btn-primary"]) {
    check(theme, `--on-accent on ${b}`, resolve(vars, "--on-accent"), resolve(vars, b), 4.5);
  }
  // 3. accent text on tinted chip backgrounds (composited over surfaces)
  for (const tint of TINTS) {
    for (const base of TINT_BASES) {
      const bg = over(resolve(vars, tint), resolve(vars, base));
      check(theme, `--accent-text on ${tint} over ${base}`, resolve(vars, "--accent-text"), bg, 4.5);
    }
  }
  // 4. focus ring: non-text contrast
  for (const b of BACKGROUNDS) {
    check(theme, `focus ring --accent-text on ${b}`, resolve(vars, "--accent-text"), resolve(vars, b), 3);
  }
}

const width = Math.max(...rows.map((r) => r.label.length));
for (const r of rows) {
  const mark = r.ok ? "ok  " : "FAIL";
  console.log(`${mark} ${r.theme.padEnd(5)} ${r.label.padEnd(width)} ${r.ratio.padStart(6)}:1  (min ${r.min})`);
}
console.log(`\n${rows.length} pairs checked, ${failures} failing.`);
process.exit(failures ? 1 : 0);
