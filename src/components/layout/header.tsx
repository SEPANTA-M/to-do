"use client";

import * as React from "react";
import { Command, Moon, Sun } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { useThemeStore } from "@/state/theme-store";

interface HeaderProps {
  onCommandOpen: () => void;
}

export function Header({ onCommandOpen }: HeaderProps) {
  const { resolvedTheme, setTheme } = useThemeStore();
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };
  
  return (
    <header className="lg:hidden sticky top-0 z-40 h-14 border-b border-border-primary bg-bg-elevated/95 backdrop-blur supports-[backdrop-filter]:bg-bg-elevated/60">
      <div className="flex items-center justify-between h-full px-4">
        <h1 className="text-lg font-bold tracking-tight text-text-primary">
          NEXUS
        </h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onCommandOpen}
            aria-label="Open command palette"
          >
            <Command className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
