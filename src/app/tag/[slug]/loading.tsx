import { IdentityHeaderSkeleton, ArticleCardSkeleton } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <div style={{ padding: "32px 36px 80px" }}>
      <IdentityHeaderSkeleton />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <ArticleCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
