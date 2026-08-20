"use client";

import Link from "next/link";
import { Target, Calendar, BarChart3, StickyNote, Settings, Moon, Sun } from "lucide-react";
import { Separator } from "@/components/primitives/separator";
import { useThemeStore } from "@/state/theme-store";
import { Button } from "@/components/primitives/button";

export default function MenuPage() {
  const { resolvedTheme, setTheme } = useThemeStore();
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };
  
  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Menu
        </h1>
      </header>
      
      <div className="space-y-6">
        {/* Navigation Links */}
        <div className="bg-bg-elevated border border-border-primary rounded-lg overflow-hidden">
          <MenuLink href="/goals" icon={<Target className="h-5 w-5" />} title="Goals" />
          <Separator />
          <MenuLink href="/calendar" icon={<Calendar className="h-5 w-5" />} title="Calendar" />
          <Separator />
          <MenuLink href="/insights" icon={<BarChart3 className="h-5 w-5" />} title="Insights" />
          <Separator />
          <MenuLink href="/notes" icon={<StickyNote className="h-5 w-5" />} title="Notes" />
          <Separator />
          <MenuLink href="/settings" icon={<Settings className="h-5 w-5" />} title="Settings" />
        </div>
        
        {/* Theme Toggle */}
        <div className="bg-bg-elevated border border-border-primary rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {resolvedTheme === "dark" ? (
                <Moon className="h-5 w-5 text-text-secondary" />
              ) : (
                <Sun className="h-5 w-5 text-text-secondary" />
              )}
              <span className="text-sm font-medium text-text-primary">
                {resolvedTheme === "dark" ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              Toggle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MenuLinkProps {
  href: string;
  icon: React.ReactNode;
  title: string;
}

function MenuLink({ href, icon, title }: MenuLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 hover:bg-bg-secondary transition-colors"
    >
      <span className="text-text-secondary">{icon}</span>
      <span className="text-sm font-medium text-text-primary">{title}</span>
    </Link>
  );
}
