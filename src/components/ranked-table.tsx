"use client";

import Link from "next/link";
import { ArrowUp, ArrowDown } from "lucide-react";
import { dark } from "@/lib/tokens";

const mono = "'JetBrains Mono', monospace";

export type RankedTableItem = {
  id: string;
  name: string;
  href: string;
  count: number;
  delta?: number | null;
  prefix?: string;
};

type Props = {
  items: RankedTableItem[];
  showDelta?: boolean;
};

export function RankedTable({ items, showDelta = true }: Props) {
  const gridCols = showDelta
    ? "40px 1fr 100px 80px 80px"
    : "40px 1fr 100px 80px";

  return (
    <div
      style={{
        background: dark.surface,
        border: `1px solid ${dark.line}`,
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        const deltaStr =
          item.delta === null || item.delta === undefined
            ? "new"
            : `${item.delta >= 0 ? "+" : ""}${item.delta}%`;
        const deltaPositive =
          item.delta === null || item.delta === undefined || item.delta >= 0;
        const deltaColor = deltaPositive ? "#4CAF50" : dark.danger;

        return (
          <div
            key={item.id}
            style={{
              display: "grid",
              gridTemplateColumns: gridCols,
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: isLast ? "none" : `1px solid ${dark.line}`,
            }}
          >
            <span
              style={{ fontFamily: mono, fontSize: 12, color: dark.textMute }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <Link
              href={item.href}
              style={{
                fontFamily: mono,
                fontSize: 15,
                fontWeight: 500,
                color: dark.text,
                textDecoration: "none",
              }}
            >
              {item.prefix}
              {item.name}
            </Link>
            <span
              style={{ fontFamily: mono, fontSize: 12, color: dark.textDim }}
            >
              {item.count} posts
            </span>
            {showDelta && (
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 12,
                  color: deltaColor,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                {item.delta !== null &&
                  item.delta !== undefined &&
                  (deltaPositive ? (
                    <ArrowUp size={11} />
                  ) : (
                    <ArrowDown size={11} />
                  ))}
                {deltaStr}
              </span>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link
                href={item.href}
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  color: dark.textMute,
                  textDecoration: "none",
                  padding: "3px 8px",
                  border: `1px solid ${dark.line2}`,
                  borderRadius: 3,
                  transition: "border-color 0.12s",
                }}
              >
                View
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
