import { Shell } from "@/components/shell";
import { SearchClient } from "./search-client";

export default function SearchPage() {
  return (
    <Shell>
      <div className="p-6">
        <SearchClient />
      </div>
    </Shell>
  );
}
