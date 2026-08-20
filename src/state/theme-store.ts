/**
 * Theme State Management
 * Zustand store for theme persistence and synchronization
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "system",
      resolvedTheme: "light",
      
      setTheme: (theme: Theme) => {
        set({ theme });
        
        // Apply theme to document
        if (typeof window !== "undefined") {
          const root = window.document.documentElement;
          root.classList.remove("light", "dark");
          
          let resolved: "light" | "dark";
          
          if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light";
            resolved = systemTheme;
            root.classList.add(systemTheme);
          } else {
            resolved = theme;
            root.classList.add(theme);
          }
          
          set({ resolvedTheme: resolved });
        }
      },
    }),
    {
      name: "nexus-theme",
    }
  )
);
