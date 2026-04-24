import { SearchClient } from "./search-client";
import { BackButton } from "@/components/ui/back-button";

export default function SearchPage() {
  return (
    <div className="p-6">
      <BackButton />
      <SearchClient />
    </div>
  );
}
