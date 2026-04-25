"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type Theme = "dark" | "light";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
    setMounted(true);
  }, []);

  const setTheme = useCallback((value: Theme) => {
    setThemeState(value);
    localStorage.setItem("theme", value);
    document.documentElement.setAttribute("data-theme", value);

    // Persist to Supabase if logged in (fire-and-forget)
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .update({ theme: value })
          .eq("id", user.id)
          .then(() => {});
      }
    });
  }, []);

  // On mount, also check Supabase profile for theme preference
  useEffect(() => {
    if (!mounted) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("theme")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.theme && (data.theme === "light" || data.theme === "dark")) {
            const profileTheme = data.theme as Theme;
            // Profile overrides localStorage only if localStorage wasn't explicitly set
            if (!localStorage.getItem("theme")) {
              setThemeState(profileTheme);
              localStorage.setItem("theme", profileTheme);
              document.documentElement.setAttribute("data-theme", profileTheme);
            }
          }
        });
    });
  }, [mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
