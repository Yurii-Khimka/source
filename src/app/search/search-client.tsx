"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import { ArticleCard } from "@/components/article-card";
import { dark } from "@/lib/tokens";

type ArticleData = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  published_at: string | null;
  like_count: number;
  source_id: string;
  sources: { name: string; handle: string; logo_url: string | null } | null;
};

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
    if (res.ok) {
      const data = await res.json();
      setResults(data);
    }
    setLoading(false);
    setSearched(true);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSearch(value), 400);
  }

  return (
    <>
      {/* Search input */}
      <div className="relative mb-4">
        <Search
          size={16}
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: dark.textMute,
          }}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full outline-none"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 15,
            background: dark.surface,
            border: `1px solid ${dark.line2}`,
            color: dark.text,
            height: 44,
            borderRadius: 6,
            paddingLeft: 44,
            paddingRight: 16,
          }}
        />
      </div>

      {/* Status line */}
      <p
        className="mb-4"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: dark.textMute,
        }}
      >
        {loading
          ? "Searching..."
          : searched
            ? `${results.length} result${results.length !== 1 ? "s" : ""} for '${query}'`
            : "Type to search..."}
      </p>

      {/* Results — only shown after searching */}
      {searched && results.length === 0 && !loading ? (
        <p
          className="text-center py-12"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: dark.textMute,
          }}
        >
          {"// no results found"}
        </p>
      ) : results.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {results.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              initialLiked={false}
              initialLikeCount={article.like_count}
              initialBookmarked={false}
              initialFollowing={false}
              initialMuted={false}
              sourceId={article.source_id}
              isLoggedIn={false}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}
