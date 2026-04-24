/**
 * Tests for /api/like and /api/bookmark toggle logic.
 *
 * These test the core toggle behavior by mocking the Supabase client
 * and calling the route handlers directly.
 */

// Mock next/headers cookies
const mockCookieStore = {
  getAll: jest.fn(() => []),
  set: jest.fn(),
};
jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => mockCookieStore),
}));

// Shared mock state for Supabase
let mockUser: { id: string } | null = null;
let mockLikesRows: { id: string; user_id: string; article_id: string }[] = [];
let mockBookmarksRows: { id: string; user_id: string; article_id: string }[] = [];
let mockArticleLikeCount = 0;

// Build a chainable Supabase query mock
function createChainableMock(resolveValue: () => unknown) {
  const chain: Record<string, jest.Mock> = {};
  const methods = ["select", "insert", "update", "delete", "eq", "maybeSingle", "single"];
  for (const method of methods) {
    chain[method] = jest.fn(() => {
      // Terminal methods return the promise
      if (method === "maybeSingle" || method === "single") {
        return Promise.resolve(resolveValue());
      }
      return chain;
    });
  }
  return chain;
}

// Track what table is being queried
jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(async () => ({
        data: { user: mockUser },
      })),
    },
    from: jest.fn((table: string) => {
      if (table === "likes") {
        return createLikesChain();
      }
      if (table === "bookmarks") {
        return createBookmarksChain();
      }
      if (table === "articles") {
        return createArticlesChain();
      }
      return createChainableMock(() => ({ data: null, error: null }));
    }),
  })),
}));

function createLikesChain() {
  let pendingOp: "select" | "insert" | "delete" | null = null;
  let filterUserId: string | null = null;
  let filterArticleId: string | null = null;

  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn(() => { pendingOp = "select"; return chain; });
  chain.insert = jest.fn((row: { user_id: string; article_id: string }) => {
    mockLikesRows.push({ id: `like-${Date.now()}`, ...row });
    return Promise.resolve({ error: null });
  });
  chain.delete = jest.fn(() => { pendingOp = "delete"; return chain; });
  chain.eq = jest.fn((col: string, val: string) => {
    if (col === "user_id") filterUserId = val;
    if (col === "article_id") filterArticleId = val;
    // For delete, execute when both filters are set
    if (pendingOp === "delete" && filterUserId && filterArticleId) {
      mockLikesRows = mockLikesRows.filter(
        (r) => !(r.user_id === filterUserId && r.article_id === filterArticleId)
      );
      return Promise.resolve({ error: null });
    }
    return chain;
  });
  chain.maybeSingle = jest.fn(() => {
    const found = mockLikesRows.find(
      (r) => r.user_id === filterUserId && r.article_id === filterArticleId
    );
    return Promise.resolve({ data: found ?? null, error: null });
  });
  chain.single = jest.fn(() => Promise.resolve({ data: null, error: null }));
  return chain;
}

function createBookmarksChain() {
  let pendingOp: "select" | "insert" | "delete" | null = null;
  let filterUserId: string | null = null;
  let filterArticleId: string | null = null;

  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn(() => { pendingOp = "select"; return chain; });
  chain.insert = jest.fn((row: { user_id: string; article_id: string }) => {
    mockBookmarksRows.push({ id: `bm-${Date.now()}`, ...row });
    return Promise.resolve({ error: null });
  });
  chain.delete = jest.fn(() => { pendingOp = "delete"; return chain; });
  chain.eq = jest.fn((col: string, val: string) => {
    if (col === "user_id") filterUserId = val;
    if (col === "article_id") filterArticleId = val;
    if (pendingOp === "delete" && filterUserId && filterArticleId) {
      mockBookmarksRows = mockBookmarksRows.filter(
        (r) => !(r.user_id === filterUserId && r.article_id === filterArticleId)
      );
      return Promise.resolve({ error: null });
    }
    return chain;
  });
  chain.maybeSingle = jest.fn(() => {
    const found = mockBookmarksRows.find(
      (r) => r.user_id === filterUserId && r.article_id === filterArticleId
    );
    return Promise.resolve({ data: found ?? null, error: null });
  });
  chain.single = jest.fn(() => Promise.resolve({ data: null, error: null }));
  return chain;
}

function createArticlesChain() {
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn(() => chain);
  chain.update = jest.fn((vals: { like_count: number }) => {
    mockArticleLikeCount = vals.like_count;
    return chain;
  });
  chain.eq = jest.fn(() => chain);
  chain.single = jest.fn(() =>
    Promise.resolve({ data: { like_count: mockArticleLikeCount }, error: null })
  );
  return chain;
}

// Import the route handlers after mocks are set up
import { POST as likeHandler } from "../app/api/like/route";
import { POST as bookmarkHandler } from "../app/api/bookmark/route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost:3000/api/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("/api/like", () => {
  beforeEach(() => {
    mockLikesRows = [];
    mockArticleLikeCount = 0;
    mockUser = null;
  });

  it("returns 401 without session", async () => {
    mockUser = null;
    const res = await likeHandler(makeRequest({ article_id: "art-1" }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns { liked: true, like_count: 1 } on first like", async () => {
    mockUser = { id: "user-1" };
    mockArticleLikeCount = 0;
    const res = await likeHandler(makeRequest({ article_id: "art-1" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.liked).toBe(true);
    expect(data.like_count).toBe(1);
    expect(mockLikesRows).toHaveLength(1);
  });

  it("returns { liked: false, like_count: 0 } on second like (toggle off)", async () => {
    mockUser = { id: "user-1" };
    mockArticleLikeCount = 1;
    mockLikesRows = [{ id: "like-1", user_id: "user-1", article_id: "art-1" }];

    const res = await likeHandler(makeRequest({ article_id: "art-1" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.liked).toBe(false);
    expect(data.like_count).toBe(0);
    expect(mockLikesRows).toHaveLength(0);
  });
});

describe("/api/bookmark", () => {
  beforeEach(() => {
    mockBookmarksRows = [];
    mockUser = null;
  });

  it("returns 401 without session", async () => {
    mockUser = null;
    const res = await bookmarkHandler(makeRequest({ article_id: "art-1" }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns { bookmarked: true } on first bookmark", async () => {
    mockUser = { id: "user-1" };
    const res = await bookmarkHandler(makeRequest({ article_id: "art-1" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.bookmarked).toBe(true);
    expect(mockBookmarksRows).toHaveLength(1);
  });

  it("returns { bookmarked: false } on second bookmark (toggle off)", async () => {
    mockUser = { id: "user-1" };
    mockBookmarksRows = [{ id: "bm-1", user_id: "user-1", article_id: "art-1" }];

    const res = await bookmarkHandler(makeRequest({ article_id: "art-1" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.bookmarked).toBe(false);
    expect(mockBookmarksRows).toHaveLength(0);
  });
});
