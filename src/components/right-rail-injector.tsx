"use client";

import { useEffect, ReactNode } from "react";
import { useRightRailTop } from "@/components/right-rail-context";

export function RightRailInjector({ children }: { children: ReactNode }) {
  const { setTopContent } = useRightRailTop();

  useEffect(() => {
    setTopContent(children);
    return () => setTopContent(null);
  }, [children, setTopContent]);

  return null;
}
