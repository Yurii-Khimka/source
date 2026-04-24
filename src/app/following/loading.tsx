import { SourceRowSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div style={{ padding: "32px 36px 60px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SourceRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
