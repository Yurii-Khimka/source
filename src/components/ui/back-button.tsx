"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { dark } from "@/lib/tokens";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="mobile-back-btn text-link cursor-pointer"
      style={{
        display: "none",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 14,
        color: dark.textDim,
        cursor: "pointer",
        padding: 0,
        marginBottom: 16,
      }}
    >
      <ArrowLeft size={16} />
      Back
    </button>
  );
}
