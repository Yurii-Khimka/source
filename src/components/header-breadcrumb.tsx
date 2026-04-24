"use client";

import { usePathname } from "next/navigation";

const routes: Record<string, { parent?: string; label: string }> = {
  "/": { parent: "Home", label: "Your feed" },
  "/search": { parent: "Home", label: "Search" },
  "/bookmarks": { parent: "Home", label: "Bookmarks" },
  "/settings": { parent: "Home", label: "Settings" },
  "/auth/signin": { parent: "Home", label: "Sign in" },
  "/auth/signup": { parent: "Home", label: "Sign up" },
};

export function HeaderBreadcrumb() {
  const pathname = usePathname();
  const route = routes[pathname] ?? { parent: "Home", label: pathname.slice(1) };

  return (
    <div
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13,
      }}
    >
      {route.parent && (
        <>
          <span style={{ color: "#A3ACBD", fontWeight: 400 }}>
            {route.parent}
          </span>
          <span style={{ color: "#A3ACBD", fontWeight: 400, margin: "0 6px" }}>
            ›
          </span>
        </>
      )}
      <span style={{ color: "#EEF1F6", fontWeight: 500 }}>{route.label}</span>
    </div>
  );
}
