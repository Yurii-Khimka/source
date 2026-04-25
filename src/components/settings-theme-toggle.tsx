"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { dark } from "@/lib/tokens";

export function SettingsThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2" style={{ padding: "12px 0" }}>
      <Button
        onClick={() => setTheme("dark")}
        className={theme === "dark" ? "btn-primary" : "btn-outline"}
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          color: theme === "dark" ? "var(--on-accent)" : dark.textMute,
          background: theme === "dark" ? dark.accent : "none",
          border: theme === "dark" ? "none" : `1px solid ${dark.line2}`,
          borderRadius: 6,
          padding: "6px 16px",
        }}
      >
        Dark
      </Button>
      <Button
        onClick={() => setTheme("light")}
        className={theme === "light" ? "btn-primary" : "btn-outline"}
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13,
          color: theme === "light" ? "var(--on-accent)" : dark.textMute,
          background: theme === "light" ? dark.accent : "none",
          border: theme === "light" ? "none" : `1px solid ${dark.line2}`,
          borderRadius: 6,
          padding: "6px 16px",
        }}
      >
        Light
      </Button>
    </div>
  );
}
