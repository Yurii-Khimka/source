"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export function SearchClient() {
  const [query, setQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [results, setResults] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(q: string) {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/search?q=" + encodeURIComponent(q));
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }

  return (
    <>
      <div style={{ position: "relative", marginBottom: 24 }}>
        <Search
          size={16}
          style={{ position: "absolute", left: 14, top: 14, color: "#6C727E" }}
        />
        <input
          autoFocus
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search articles..."
          style={{
            width: "100%",
            height: 44,
            paddingLeft: 40,
            paddingRight: 16,
            background: "#11151D",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 6,
            color: "#EEF1F6",
            fontSize: 15,
            fontFamily: "'JetBrains Mono', monospace",
            outline: "none",
            boxSizing: "border-box" as const,
          }}
        />
      </div>

      {loading && (
        <p style={{ fontFamily: "monospace", color: "#6C727E", fontSize: 11 }}>
          Searching...
        </p>
      )}
      {!loading && query.length >= 2 && results.length === 0 && (
        <p style={{ fontFamily: "monospace", color: "#6C727E", fontSize: 11 }}>
          {"// no results found"}
        </p>
      )}
      {!loading && query.length < 2 && (
        <p style={{ fontFamily: "monospace", color: "#6C727E", fontSize: 11 }}>
          {"// type to search articles"}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {results.map((article) => (
          <div
            key={article.id}
            style={{
              background: "#11151D",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#6C727E",
                marginBottom: 6,
              }}
            >
              {article.sources?.handle ? (
                <Link
                  href={`/source/${article.sources.handle}`}
                  style={{ color: "#6C727E", textDecoration: "none" }}
                >
                  {article.sources.name}
                </Link>
              ) : (
                article.sources?.name
              )}{" "}
              · {new Date(article.published_at).toLocaleDateString("en-US")}
            </div>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#EEF1F6",
                textDecoration: "none",
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: 18,
                fontWeight: 700,
                lineHeight: 1.3,
                display: "block",
                marginBottom: 8,
              }}
            >
              {article.title}
            </a>
            {article.description && (
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  color: "#C7CCD6",
                  lineHeight: 1.55,
                }}
              >
                {article.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
