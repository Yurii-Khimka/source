#!/usr/bin/env node
/**
 * Tiny in-memory stand-in for Supabase (PostgREST + GoTrue), used only by the
 * accessibility audit (scripts/a11y/audit.mjs) so pages render without a real
 * database. Supports the subset of PostgREST the app uses: column/alias
 * selects, embeds (`alias:table(...)`, `table!inner(...)`), eq/neq/in/is/not/
 * gte/lte/gt/lt/ilike filters (incl. on embedded tables), order, limit/offset,
 * `Prefer: count=exact`, HEAD, single-object responses. Writes are accepted and
 * ignored.
 *
 * Usage: node scripts/a11y/mock-supabase.mjs [port]   (default 54321)
 */
import http from "node:http";

const PORT = Number(process.argv[2] ?? 54321);
export const USER_ID = "00000000-0000-4000-8000-000000000001";

// ── Fixtures (fictional) ────────────────────────────────────────────────
const now = Date.now();
const hoursAgo = (h) => new Date(now - h * 3600e3).toISOString();

const sources = [
  ["s1", "kyivdaily", "Kyiv Daily", "verified"],
  ["s2", "northledger", "Northern Ledger", "verified"],
  ["s3", "dniprowire", "Dnipro Wire", "pending"],
  ["s4", "eastreport", "East Report", "verified"],
  ["s5", "globalbrief", "Global Brief", "unverified"],
  ["s6", "techdesk", "Tech Desk", "verified"],
].map(([id, handle, name, verification_status], i) => ({
  id, handle, name, verification_status,
  site_url: null, // no favicon lookup → initials avatar (deterministic, offline)
  rss_url: `https://${handle}.example/rss`,
  logo_url: null,
  language: "en",
  is_hidden: false,
  created_at: hoursAgo(24 * 90 + i),
}));

const tags = [
  ["t1", "politics", "Politics"],
  ["t2", "economy", "Economy"],
  ["t3", "tech", "Tech"],
  ["t4", "weather", "Weather"],
  ["t5", "sport", "Sport"],
  ["t6", "culture", "Culture"],
].map(([id, slug, label]) => ({ id, slug, label }));

const titles = [
  "City council approves new budget for public transport upgrades",
  "Grain exports rise for the third month in a row",
  "Startups in Lviv attract record seed funding this quarter",
  "Heavy snow expected across northern regions this weekend",
  "National team secures late win in qualifying match",
  "Museum reopens with an exhibition of restored icons",
  "Parliament debates changes to the energy tariff law",
  "Central bank keeps interest rate unchanged",
  "New open-source tool helps volunteers map damaged buildings",
  "Rail operator adds night trains between Kyiv and Odesa",
  "Farmers report a strong sunflower harvest",
  "Local theatre festival returns after a two-year pause",
];

const articles = titles.map((title, i) => ({
  id: `a${i + 1}`,
  source_id: sources[i % sources.length].id,
  title,
  url: `https://${sources[i % sources.length].handle}.example/news/${i + 1}`,
  description:
    "A short summary of the story taken from the RSS feed. It gives readers enough context to decide whether to open the full article on the publisher's site.",
  image_url: null,
  language: "en",
  published_at: hoursAgo(i * 2 + 0.5),
  fetched_at: hoursAgo(i * 2),
  is_hidden: false,
  like_count: (i * 7) % 23,
  bookmark_count: (i * 3) % 11,
}));

const article_tags = articles.flatMap((a, i) => [
  { article_id: a.id, tag_id: tags[i % tags.length].id },
  { article_id: a.id, tag_id: tags[(i + 2) % tags.length].id },
]);

const follows = [
  { id: "f1", user_id: USER_ID, source_id: "s1", tag_id: null },
  { id: "f2", user_id: USER_ID, source_id: "s2", tag_id: null },
  { id: "f3", user_id: USER_ID, source_id: "s4", tag_id: null },
  { id: "f4", user_id: USER_ID, source_id: null, tag_id: "t1" },
  { id: "f5", user_id: USER_ID, source_id: null, tag_id: "t3" },
  { id: "f6", user_id: "u2", source_id: "s1", tag_id: null },
  { id: "f7", user_id: "u3", source_id: "s3", tag_id: null },
];

const likes = [{ id: "l1", user_id: USER_ID, article_id: "a1" }, { id: "l2", user_id: USER_ID, article_id: "a4" }];
const bookmarks = [{ id: "b1", user_id: USER_ID, article_id: "a2" }];
const profiles = [{
  id: USER_ID, display_name: "Audit User", avatar_url: null, theme: null,
  onboarding_completed: true, created_at: hoursAgo(24 * 30),
}];

const DB = { sources, tags, articles, article_tags, follows, likes, bookmarks, profiles, mutes: [], muted_sources: [] };

// Foreign keys: table -> { otherTable: [localCol, remoteCol] }
const FK = {
  articles: { sources: ["source_id", "id", "one"], article_tags: ["id", "article_id", "many"] },
  article_tags: { articles: ["article_id", "id", "one"], tags: ["tag_id", "id", "one"] },
  tags: { article_tags: ["id", "tag_id", "many"] },
  sources: { articles: ["id", "source_id", "many"], follows: ["id", "source_id", "many"] },
  follows: { sources: ["source_id", "id", "one"], tags: ["tag_id", "id", "one"] },
  likes: { articles: ["article_id", "id", "one"] },
  bookmarks: { articles: ["article_id", "id", "one"] },
};

// ── select parser ───────────────────────────────────────────────────────
function splitTop(s) {
  const out = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function parseSelect(s) {
  return splitTop(s || "*").map((item) => {
    const m = item.match(/^(?:([\w]+):)?([\w*]+)(?:!(\w+))?(?:\((.*)\))?$/s);
    if (!m) return { col: item };
    const [, alias, name, hint, inner] = m;
    if (inner !== undefined) return { embed: name, alias: alias || name, inner: hint === "inner", select: parseSelect(inner) };
    return { col: name, alias: alias || name };
  });
}

// ── filters ─────────────────────────────────────────────────────────────
function parseValue(v) {
  if (v === "null") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  return v;
}

function makePred(opExpr) {
  let negate = false;
  if (opExpr.startsWith("not.")) { negate = true; opExpr = opExpr.slice(4); }
  const dot = opExpr.indexOf(".");
  const op = opExpr.slice(0, dot);
  const raw = opExpr.slice(dot + 1);
  let fn;
  switch (op) {
    case "eq": fn = (x) => String(x) === String(parseValue(raw)) || x === parseValue(raw); break;
    case "neq": fn = (x) => String(x) !== String(parseValue(raw)); break;
    case "is": fn = (x) => (raw === "null" ? x == null : x === parseValue(raw)); break;
    case "in": {
      const list = raw.replace(/^\(|\)$/g, "").split(",").map((v) => v.replace(/^"|"$/g, ""));
      fn = (x) => list.includes(String(x));
      break;
    }
    case "gte": fn = (x) => x >= raw; break;
    case "gt": fn = (x) => x > raw; break;
    case "lte": fn = (x) => x <= raw; break;
    case "lt": fn = (x) => x < raw; break;
    case "ilike":
    case "like": {
      const re = new RegExp("^" + raw.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/[*%]/g, ".*") + "$", "i");
      fn = (x) => re.test(String(x ?? ""));
      break;
    }
    default: fn = () => true;
  }
  return negate ? (x) => !fn(x) : fn;
}

// ── query execution ─────────────────────────────────────────────────────
function shape(table, row, select, embedFilters) {
  const out = {};
  for (const s of select) {
    if (s.col === "*") Object.assign(out, row);
    else if (s.col) out[s.alias] = row[s.col];
    else if (s.embed) {
      const rel = FK[table]?.[s.embed];
      if (!rel) { out[s.alias] = null; continue; }
      const [local, remote, kind] = rel;
      let rows = (DB[s.embed] || []).filter((r) => r[remote] === row[local]);
      for (const [col, pred] of embedFilters[s.alias] || embedFilters[s.embed] || []) rows = rows.filter((r) => pred(r[col]));
      const shaped = rows.map((r) => shape(s.embed, r, s.select, {}));
      out[s.alias] = kind === "one" ? shaped[0] ?? null : shaped;
    }
  }
  return out;
}

function runQuery(table, params) {
  const select = parseSelect(params.get("select"));
  const filters = [];
  const embedFilters = {};
  for (const [k, v] of params) {
    if (["select", "order", "limit", "offset", "on_conflict", "columns"].includes(k)) continue;
    if (k === "or") continue; // not needed by audited pages
    if (k.includes(".")) {
      const [emb, col] = k.split(".");
      (embedFilters[emb] ||= []).push([col, makePred(v)]);
    } else filters.push([k, makePred(v)]);
  }
  let rows = (DB[table] || []).filter((r) => filters.every(([c, p]) => p(r[c])));
  let out = rows.map((r) => shape(table, r, select, embedFilters));
  // !inner embeds drop parents without matches
  for (const s of select) {
    if (s.embed && s.inner) out = out.filter((r) => (Array.isArray(r[s.alias]) ? r[s.alias].length : r[s.alias]));
  }
  // non-inner embeds with filters on a to-one relation also null out (PostgREST semantics), keep rows.
  const order = params.get("order");
  if (order) {
    const keys = order.split(",").map((o) => {
      const [col, dir] = o.split(".");
      return [col, dir === "desc" ? -1 : 1];
    });
    // sort by underlying rows: use the original table column values
    const idx = new Map(rows.map((r, i) => [r, i]));
    const pairs = out.map((o, i) => [o, rows.find((r) => r.id === o.id) || rows[i]]);
    pairs.sort((a, b) => {
      for (const [c, d] of keys) {
        const x = a[1]?.[c], y = b[1]?.[c];
        if (x < y) return -d;
        if (x > y) return d;
      }
      return 0;
    });
    out = pairs.map((p) => p[0]);
    void idx;
  }
  const total = out.length;
  const offset = Number(params.get("offset") ?? 0);
  const limit = params.has("limit") ? Number(params.get("limit")) : undefined;
  out = out.slice(offset, limit !== undefined ? offset + limit : undefined);
  return { rows: out, total, offset };
}

// ── HTTP ────────────────────────────────────────────────────────────────
const USER = {
  id: USER_ID, aud: "authenticated", role: "authenticated", email: "audit@example.test",
  app_metadata: { provider: "email" }, user_metadata: {}, created_at: hoursAgo(24 * 30),
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "*",
    "access-control-expose-headers": "content-range",
    ...headers,
  });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (req.method === "OPTIONS") return send(res, 204);

  if (url.pathname.startsWith("/auth/v1/user")) {
    const auth = req.headers.authorization || "";
    // anon key alone (no user session) → logged out
    if (!auth || auth.includes("anon")) return send(res, 401, { message: "no session" });
    return send(res, 200, USER);
  }
  if (url.pathname.startsWith("/auth/v1/")) return send(res, 200, {});

  const m = url.pathname.match(/^\/rest\/v1\/(?:rpc\/)?(\w+)$/);
  if (!m) return send(res, 404, { message: "not found" });
  if (url.pathname.includes("/rpc/")) return send(res, 200, null);
  if (!["GET", "HEAD"].includes(req.method)) {
    req.resume();
    return send(res, req.method === "POST" ? 201 : 204, req.method === "POST" ? [] : undefined);
  }

  const { rows, total, offset } = runQuery(m[1], url.searchParams);
  const prefer = req.headers.prefer || "";
  const headers = {};
  if (prefer.includes("count=exact")) {
    headers["content-range"] = rows.length ? `${offset}-${offset + rows.length - 1}/${total}` : `*/${total}`;
  }
  const wantsObject = (req.headers.accept || "").includes("vnd.pgrst.object");
  if (req.method === "HEAD") return send(res, 200, undefined, headers);
  if (wantsObject) {
    if (rows.length === 1) return send(res, 200, rows[0], headers);
    return send(res, 406, { code: "PGRST116", message: "JSON object requested, multiple (or no) rows returned", details: `Results contain ${rows.length} rows` });
  }
  return send(res, 200, rows, headers);
});

server.listen(PORT, "127.0.0.1", () => console.log(`mock supabase on http://127.0.0.1:${PORT}`));
