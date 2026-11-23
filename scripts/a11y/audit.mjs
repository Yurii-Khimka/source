#!/usr/bin/env node
/**
 * axe-core audit + screenshots for the main pages, in both themes.
 *
 *   BASE_URL=http://localhost:3001 OUT=docs/a11y/after node scripts/a11y/audit.mjs
 *
 * Expects the app to run against scripts/a11y/mock-supabase.mjs
 * (NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321). Signs in a mock user by
 * writing a Supabase session cookie, so /following and the follow/like states
 * render. Needs `playwright` and `axe-core` resolvable (or AXE_PATH pointing
 * at axe.min.js). Writes <OUT>/<theme>-<page>.png and <OUT>/axe-report.json,
 * prints a summary and exits 1 if any `color-contrast` violation is found.
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.OUT ?? "docs/a11y/after";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
const AXE_PATH = process.env.AXE_PATH ?? require.resolve("axe-core/axe.min.js");
const USER_ID = "00000000-0000-4000-8000-000000000001";

const PAGES = [
  ["home", "/"],
  ["discovery", "/discovery"],
  ["following", "/following"],
  ["source", "/source/kyivdaily"],
  ["tag", "/tag/politics"],
];
const THEMES = ["dark", "light"];

function b64url(obj) {
  return Buffer.from(typeof obj === "string" ? obj : JSON.stringify(obj)).toString("base64url");
}

function sessionCookie() {
  const exp = Math.floor(Date.now() / 1000) + 3600 * 24;
  const jwt = [
    b64url({ alg: "HS256", typ: "JWT" }),
    b64url({ sub: USER_ID, role: "authenticated", aud: "authenticated", exp }),
    "sig",
  ].join(".");
  const session = {
    access_token: jwt,
    token_type: "bearer",
    expires_in: 3600 * 24,
    expires_at: exp,
    refresh_token: "mock-refresh",
    user: { id: USER_ID, aud: "authenticated", role: "authenticated", email: "audit@example.test" },
  };
  const ref = new URL(SUPABASE_URL).hostname.split(".")[0];
  return { name: `sb-${ref}-auth-token`, value: "base64-" + b64url(session) };
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const report = [];
let contrastFailures = 0;

for (const theme of THEMES) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const { host } = new URL(BASE_URL);
  await context.addCookies([{ ...sessionCookie(), domain: host.split(":")[0], path: "/" }]);
  await context.addInitScript((t) => {
    try { localStorage.setItem("theme", t); } catch {}
    document.documentElement.setAttribute("data-theme", t);
  }, theme);

  for (const [name, route] of PAGES) {
    const page = await context.newPage();
    const res = await page.goto(BASE_URL + route, { waitUntil: "networkidle", timeout: 120_000 });
    await page.waitForTimeout(800);
    const status = res?.status();
    await page.screenshot({ path: path.join(OUT, `${theme}-${name}.png`) });

    await page.addScriptTag({ path: AXE_PATH });
    const result = await page.evaluate(async () =>
      // eslint-disable-next-line no-undef
      axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } })
    );
    const violations = result.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.map((n) => ({ target: n.target.join(" "), summary: n.failureSummary?.split("\n").slice(0, 2).join(" ") })),
    }));
    const contrast = violations.find((v) => v.id === "color-contrast");
    contrastFailures += contrast?.nodes.length ?? 0;
    report.push({ theme, page: name, route, status, violations });
    console.log(
      `${theme.padEnd(5)} ${route.padEnd(18)} HTTP ${status}  color-contrast: ${contrast?.nodes.length ?? 0}  other rules: ${
        violations.filter((v) => v.id !== "color-contrast").map((v) => `${v.id}(${v.nodes.length})`).join(", ") || "none"
      }`
    );
    await page.close();
  }
  await context.close();
}

await browser.close();
writeFileSync(path.join(OUT, "axe-report.json"), JSON.stringify(report, null, 2));
console.log(`\ncolor-contrast nodes failing: ${contrastFailures}`);
process.exit(contrastFailures ? 1 : 0);
