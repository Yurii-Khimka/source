"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

type Props = {
  size?: number;
  style?: React.CSSProperties;
  className?: string;
};

export function ThemeToggle({ size = 18, style, className }: Props) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Toggle theme"
      className={className}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "var(--text-dim)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 200ms ease-out",
        ...style,
      }}
    >
      {theme === "dark" ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );
}
