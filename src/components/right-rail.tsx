"use client";

import Link from "next/link";
import useSWR from "swr";
import { dark } from "@/lib/tokens";

const inter = "'Inter', system-ui, sans-serif";
const mono = "'JetBrains Mono', monospace";

const sectionTitle: React.CSSProperties = {
  fontFamily: mono,
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  color: dark.textMute,
  marginBottom: 10,
};

type ActiveUserProfile = {
  display_name: string | null;
  avatar_url: string | null;
};

type RightRailData = {
  stats: { activeUsers: number; totalSources: number; totalArticles: number };
  activeUserProfiles: ActiveUserProfile[];
  trendingSources: { id: string; handle: string; name: string }[];
  recentTags: { slug: string; name: string; count: number }[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function RightRail() {
  const { data } = useSWR<RightRailData>("/api/right-rail", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const stats = data
    ? [
        { label: "Active users (24h)", value: data.stats.activeUsers },
        { label: "Total sources", value: data.stats.totalSources },
        { label: "Total articles", value: data.stats.totalArticles },
      ]
    : [];

  const activeUserProfiles = data?.activeUserProfiles ?? [];
  const trendingSources = data?.trendingSources ?? [];
  const recentTags = data?.recentTags ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Widget 1 — Integrity · Live */}
      <div
        style={{
          background: dark.surface,
          border: `1px solid ${dark.line}`,
          borderRadius: 8,
          padding: 14,
        }}
      >
        <div style={sectionTitle}>Integrity · Live</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontFamily: inter, fontSize: 12, color: dark.textDim }}>
                {s.label}
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  fontWeight: 700,
                  color: dark.text,
                }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Widget 2 — Active users */}
      {activeUserProfiles.length > 0 && (
        <div>
          <div style={sectionTitle}>Active now</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {activeUserProfiles.map((u, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 0",
                }}
              >
                {u.avatar_url ? (
                  <img
                    src={u.avatar_url}
                    alt=""
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `1px solid ${dark.line}`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: dark.surface2,
                      border: `1px solid ${dark.line}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: mono,
                      fontSize: 10,
                      color: dark.textDim,
                    }}
                  >
                    {(u.display_name ?? "?")[0].toUpperCase()}
                  </div>
                )}
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: 12,
                    color: dark.textSub,
                  }}
                >
                  {u.display_name ?? "Anonymous"}
                </span>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: dark.success,
                    marginLeft: "auto",
                    flexShrink: 0,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Widget 3 — Trending sources */}
      {trendingSources.length > 0 && (
        <div>
          <div style={sectionTitle}>Trending sources</div>
          <div className="space-y-0.5">
            {trendingSources.map((source) => (
              <Link
                key={source.id}
                href={`/source/${source.handle}`}
                className="source-row block truncate"
                style={{
                  fontFamily: inter,
                  fontSize: 13,
                  color: dark.textSub,
                  padding: "6px 8px",
                  borderRadius: 4,
                  textDecoration: "none",
                }}
              >
                <span style={{ color: dark.textDim }}>@</span>
                {source.handle}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Widget 3 — Recent hashtags */}
      {recentTags.length > 0 && (
        <div>
          <div style={sectionTitle}>Recent hashtags</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {recentTags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tag/${tag.slug}`}
                className="right-rail-tag"
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: dark.textSub,
                  padding: "2px 7px",
                  borderRadius: 3,
                  border: `1px solid ${dark.line2}`,
                  background: dark.surface,
                  textDecoration: "none",
                  transition: "border-color 0.12s",
                }}
              >
                #{tag.slug}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          borderTop: `1px solid ${dark.line}`,
          paddingTop: 14,
          marginTop: "auto",
          fontFamily: mono,
          fontSize: 10,
          color: dark.textMute,
          lineHeight: 1.8,
        }}
      >
        <div><Link href="/about" className="footer-link" style={{ color: dark.textMute, textDecoration: "none" }}>About</Link> · <Link href="/feedback" className="footer-link" style={{ color: dark.textMute, textDecoration: "none" }}>Feedback</Link> · <Link href="/privacy" className="footer-link" style={{ color: dark.textMute, textDecoration: "none" }}>Privacy</Link> · <Link href="/terms" className="footer-link" style={{ color: dark.textMute, textDecoration: "none" }}>Terms</Link> · <Link href="/trust" className="footer-link" style={{ color: dark.textMute, textDecoration: "none" }}>Standards</Link> · <a href="https://github.com/Yurii-Khimka/source" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ color: dark.textMute, textDecoration: "none" }}>GitHub</a></div>
        <div>© 2026 The Source</div>
      </div>
    </div>
  );
}
