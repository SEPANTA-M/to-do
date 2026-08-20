"use client";

import { Command, Moon, Sun } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { useThemeStore } from "@/state/theme-store";
import { useT } from "@/i18n/use-t";

interface HeaderProps {
  onCommandOpen: () => void;
}

export function Header({ onCommandOpen }: HeaderProps) {
  const { resolvedTheme, setTheme } = useThemeStore();
  const t = useT();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="lg:hidden sticky top-0 z-40 h-12 border-b border-border-primary bg-bg-primary">
      <div className="flex items-center justify-between h-full px-4">
        <span className="text-[12px] font-medium tracking-[0.22em] text-text-primary">
          NEXUS
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={t("theme.toggle")}
            className="h-9 w-9"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCommandOpen}
            aria-label={t("command.open")}
            className="h-9 w-9"
          >
            <Command className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
