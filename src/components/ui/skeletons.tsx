import { dark } from "@/lib/tokens";
import { Skeleton } from "./skeleton";

export function ArticleCardSkeleton() {
  return (
    <div
      style={{
        background: dark.surface,
        border: `1px solid ${dark.line}`,
        borderRadius: 8,
        padding: 16,
      }}
    >
      {/* Row 1 — Source header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Skeleton width={32} height={32} borderRadius={6} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Skeleton width={120} height={14} />
          <Skeleton width={80} height={11} />
        </div>
      </div>
      {/* Row 2 — Title lines */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        <Skeleton width="100%" height={18} />
        <Skeleton width="100%" height={18} />
        <Skeleton width="60%" height={18} />
      </div>
      {/* Row 3 — Image area */}
      <Skeleton width="100%" height={200} borderRadius={4} style={{ marginBottom: 12 }} />
      {/* Row 4 — Tags */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <Skeleton width={60} height={22} borderRadius={3} />
        <Skeleton width={80} height={22} borderRadius={3} />
      </div>
      {/* Divider */}
      <div style={{ borderTop: `1px solid ${dark.line}`, margin: "0 -16px" }} />
      {/* Row 5 — Footer */}
      <div style={{ display: "flex", gap: 12, paddingTop: 10 }}>
        <Skeleton width={48} height={22} borderRadius={6} />
        <Skeleton width={22} height={22} borderRadius={4} />
        <div style={{ flex: 1 }} />
        <Skeleton width={60} height={14} />
      </div>
    </div>
  );
}

export function SourceRowSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 56,
        padding: "12px 16px",
      }}
    >
      <Skeleton width={32} height={32} borderRadius={6} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <Skeleton width={100} height={14} />
        <Skeleton width={60} height={11} />
      </div>
      <Skeleton width={64} height={28} borderRadius={4} />
    </div>
  );
}

export function TagRowSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 48,
        padding: "10px 16px",
      }}
    >
      <Skeleton width={20} height={20} borderRadius={4} />
      <Skeleton width={80} height={14} />
      <Skeleton width={50} height={11} />
      <div style={{ flex: 1 }} />
      <Skeleton width={64} height={28} borderRadius={4} />
    </div>
  );
}

export function RightRailSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Section 1 — sources */}
      <div
        style={{
          background: dark.surface,
          border: `1px solid ${dark.line}`,
          borderRadius: 8,
          padding: 14,
        }}
      >
        <Skeleton width={80} height={10} style={{ marginBottom: 14 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Skeleton width={32} height={32} borderRadius={6} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                <Skeleton width={90} height={13} />
                <Skeleton width={60} height={10} />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Divider */}
      <div style={{ height: 1, background: dark.line }} />
      {/* Section 2 — tags */}
      <div>
        <Skeleton width={80} height={10} style={{ marginBottom: 10 }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} width={70} height={22} borderRadius={3} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function IdentityHeaderSkeleton() {
  return (
    <div style={{ marginBottom: 24 }}>
      <Skeleton width="60%" height={32} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={14} />
    </div>
  );
}
