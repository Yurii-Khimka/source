import { ArticleCardSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div className="page-content" style={{ padding: "22px 36px 80px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
