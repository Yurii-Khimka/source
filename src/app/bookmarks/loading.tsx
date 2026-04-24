import { ArticleCardSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div className="p-6">
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
