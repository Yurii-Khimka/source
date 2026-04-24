"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { dark } from "@/lib/tokens";
import { Spinner } from "@/components/ui/spinner";

const mono = "'JetBrains Mono', monospace";
const serif = "'Source Serif 4', Georgia, serif";
const inter = "'Inter', system-ui, sans-serif";

type SourceData = {
  id: string;
  handle: string;
  name: string;
  logo_url: string | null;
  verification_status: string | null;
};

type TagData = {
  id: string;
  slug: string;
  name: string;
  postCount: number;
};

type Tab = "sources" | "tags";

type Props = {
  sources: SourceData[];
  tags: TagData[];
};

function handleToColor(handle: string): string {
  let hash = 0;
  for (let i = 0; i < handle.length; i++) {
    hash = handle.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    "#3d5a80", "#e0b14f", "#ee6c4d", "#5b8fb9",
    "#9c6ade", "#44bd8f", "#cf6a87", "#4a9ec5",
    "#d4845a", "#7b6bb5",
  ];
  return colors[Math.abs(hash) % colors.length];
}

export function FollowingClient({ sources: initialSources, tags: initialTags }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("sources");
  const [sources, setSources] = useState(initialSources);
  const [tags, setTags] = useState(initialTags);
  const [loadingSource, setLoadingSource] = useState<Set<string>>(new Set());
  const [loadingTag, setLoadingTag] = useState<Set<string>>(new Set());

  async function unfollowSource(sourceId: string) {
    setLoadingSource((prev) => new Set(prev).add(sourceId));
    setSources((prev) => prev.filter((s) => s.id !== sourceId));

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_id: sourceId }),
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("followChanged"));
      }
    } catch {
      // Re-add on failure
      const original = initialSources.find((s) => s.id === sourceId);
      if (original) setSources((prev) => [...prev, original].sort((a, b) => a.name.localeCompare(b.name)));
    } finally {
      setLoadingSource((prev) => {
        const next = new Set(prev);
        next.delete(sourceId);
        return next;
      });
    }
  }

  async function unfollowTag(tagId: string) {
    setLoadingTag((prev) => new Set(prev).add(tagId));
    setTags((prev) => prev.filter((t) => t.id !== tagId));

    try {
      const res = await fetch("/api/follow-tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag_id: tagId }),
      });
      if (res.ok) {
        window.dispatchEvent(new CustomEvent("tagFollowChanged"));
      }
    } catch {
      const original = initialTags.find((t) => t.id === tagId);
      if (original) setTags((prev) => [...prev, original].sort((a, b) => b.postCount - a.postCount));
    } finally {
      setLoadingTag((prev) => {
        const next = new Set(prev);
        next.delete(tagId);
        return next;
      });
    }
  }

  const tabItems: { key: Tab; label: string; count: number }[] = [
    { key: "sources", label: "Sources", count: sources.length },
    { key: "tags", label: "Tags", count: tags.length },
  ];

  return (
    <div className="page-content" style={{ padding: "32px 36px 60px" }}>
      {/* Header */}
      <h1
        style={{
          fontFamily: serif,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: -0.5,
          color: dark.text,
          margin: 0,
        }}
      >
        Following
      </h1>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 24,
          borderBottom: `1px solid ${dark.line}`,
          marginTop: 20,
          marginBottom: 24,
        }}
      >
        {tabItems.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="nav-tab cursor-pointer"
              style={{
                fontFamily: inter,
                fontSize: 13,
                fontWeight: 500,
                color: active ? dark.text : dark.textDim,
                background: "none",
                border: "none",
                borderBottom: active ? `2px solid ${dark.accent}` : "2px solid transparent",
                padding: "8px 0",
                marginBottom: -1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {tab.label}
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  background: dark.surface2,
                  border: `1px solid ${dark.line2}`,
                  borderRadius: 3,
                  padding: "1px 5px",
                  lineHeight: 1.4,
                  color: active ? dark.textDim : dark.textMute,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sources tab */}
      {activeTab === "sources" && (
        sources.length === 0 ? (
          <p
            className="text-center"
            style={{ fontFamily: mono, fontSize: 12, color: dark.textDim, paddingTop: 48 }}
          >
            You are not following any sources yet.
          </p>
        ) : (
          <div
            style={{
              background: dark.surface,
              border: `1px solid ${dark.line}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {sources.map((source, i) => (
              <div
                key={source.id}
                className="source-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: i < sources.length - 1 ? `1px solid ${dark.line}` : "none",
                }}
              >
                {/* Logo */}
                <Link href={`/source/${source.handle}`} className="flex-shrink-0" style={{ textDecoration: "none" }}>
                  {source.logo_url ? (
                    <img
                      src={source.logo_url}
                      alt={source.name}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: handleToColor(source.handle),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: inter,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {source.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </Link>

                {/* Name + handle */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Link
                      href={`/source/${source.handle}`}
                      className="text-link"
                      style={{
                        fontFamily: inter,
                        fontSize: 13,
                        fontWeight: 600,
                        color: dark.text,
                        textDecoration: "none",
                      }}
                    >
                      {source.name}
                    </Link>
                    <CheckCircle2 size={12} style={{ color: dark.accent, flexShrink: 0 }} />
                  </div>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: dark.textMute,
                      marginTop: 1,
                    }}
                  >
                    @{source.handle}
                  </div>
                </div>

                {/* Unfollow */}
                <button
                  onClick={() => unfollowSource(source.id)}
                  disabled={loadingSource.has(source.id)}
                  className="btn-outline cursor-pointer"
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "5px 12px",
                    borderRadius: 4,
                    cursor: loadingSource.has(source.id) ? "wait" : "pointer",
                    background: "transparent",
                    color: dark.textDim,
                    border: `1px solid ${dark.line2}`,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {loadingSource.has(source.id) && <Spinner />}
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tags tab */}
      {activeTab === "tags" && (
        tags.length === 0 ? (
          <p
            className="text-center"
            style={{ fontFamily: mono, fontSize: 12, color: dark.textDim, paddingTop: 48 }}
          >
            You are not following any tags yet.
          </p>
        ) : (
          <div
            style={{
              background: dark.surface,
              border: `1px solid ${dark.line}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {tags.map((tag, i) => (
              <div
                key={tag.id}
                className="source-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: i < tags.length - 1 ? `1px solid ${dark.line}` : "none",
                }}
              >
                {/* Hash symbol */}
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 20,
                    fontWeight: 700,
                    color: dark.accent,
                    width: 32,
                    textAlign: "center",
                    flexShrink: 0,
                  }}
                >
                  #
                </span>

                {/* Tag name + post count */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/tag/${tag.slug}`}
                    className="text-link"
                    style={{
                      fontFamily: inter,
                      fontSize: 13,
                      fontWeight: 600,
                      color: dark.text,
                      textDecoration: "none",
                    }}
                  >
                    {tag.slug}
                  </Link>
                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 11,
                      color: dark.textMute,
                      marginTop: 1,
                    }}
                  >
                    {tag.postCount.toLocaleString()} posts
                  </div>
                </div>

                {/* Unfollow */}
                <button
                  onClick={() => unfollowTag(tag.id)}
                  disabled={loadingTag.has(tag.id)}
                  className="btn-outline cursor-pointer"
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "5px 12px",
                    borderRadius: 4,
                    cursor: loadingTag.has(tag.id) ? "wait" : "pointer",
                    background: "transparent",
                    color: dark.textDim,
                    border: `1px solid ${dark.line2}`,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {loadingTag.has(tag.id) && <Spinner />}
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
