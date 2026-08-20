"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  ListTodo,
  FolderKanban,
  Target,
  Calendar,
  Zap,
  BarChart3,
  StickyNote,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Map,
} from "lucide-react";
import { Button } from "@/components/primitives/button";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/state/ui-store";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const primaryNav: NavItem[] = [
  { title: "Today", href: "/", icon: <Inbox className="h-4 w-4" /> },
  { title: "Tasks", href: "/tasks", icon: <ListTodo className="h-4 w-4" /> },
  { title: "Projects", href: "/projects", icon: <FolderKanban className="h-4 w-4" /> },
  { title: "Focus", href: "/focus", icon: <Zap className="h-4 w-4" /> },
  { title: "Insights", href: "/insights", icon: <BarChart3 className="h-4 w-4" /> },
];

const secondaryNav: NavItem[] = [
  { title: "Goals", href: "/goals", icon: <Target className="h-4 w-4" /> },
  { title: "Calendar", href: "/calendar", icon: <Calendar className="h-4 w-4" /> },
  { title: "Life map", href: "/life-map", icon: <Map className="h-4 w-4" /> },
  { title: "Notes", href: "/notes", icon: <StickyNote className="h-4 w-4" /> },
];

export function Sidebar({ onNewTask }: { onNewTask?: () => void }) {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebarCollapsed);

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col h-screen sticky top-0 border-r border-border-primary bg-bg-secondary transition-[width] duration-base",
        collapsed ? "w-14" : "w-[13.75rem]"
      )}
    >
      <div className={cn("h-14 flex items-center border-b border-border-primary", collapsed ? "justify-center px-0" : "justify-between px-3")}>
        {!collapsed && (
          <Link href="/" className="text-[13px] font-medium tracking-[0.22em] text-text-primary">
            NEXUS
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewTask}
          aria-label="Create task"
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-6 overflow-y-auto">
        <div className="space-y-0.5">
          {primaryNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              isActive={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)}
              collapsed={collapsed}
              title={item.title}
            >
              {item.icon}
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </div>

        <div className="space-y-0.5">
          {!collapsed && <div className="px-2 pb-1 label-caps">More</div>}
          {secondaryNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              isActive={pathname === item.href || pathname.startsWith(item.href)}
              collapsed={collapsed}
              title={item.title}
            >
              {item.icon}
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-2 border-t border-border-primary space-y-0.5">
        <NavLink href="/settings" isActive={pathname === "/settings"} collapsed={collapsed} title="Settings">
          <Settings className="h-4 w-4" />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex w-full items-center gap-2.5 px-2 py-2 rounded text-[13px] text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors duration-fast",
            collapsed && "justify-center"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

function NavLink({
  href,
  isActive,
  collapsed,
  title,
  children,
}: {
  href: string;
  isActive: boolean;
  collapsed: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? title : undefined}
      className={cn(
        "flex items-center gap-2.5 px-2 py-2 rounded text-[13px] transition-colors duration-fast min-h-9",
        collapsed && "justify-center",
        isActive
          ? "bg-bg-tertiary text-text-primary"
          : "text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/60"
      )}
    >
      {children}
    </Link>
  );
}
