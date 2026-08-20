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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const primaryNav: NavItem[] = [
  {
    title: "Today",
    href: "/",
    icon: <Inbox className="h-5 w-5" />,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: <ListTodo className="h-5 w-5" />,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    title: "Goals",
    href: "/goals",
    icon: <Target className="h-5 w-5" />,
  },
];

const secondaryNav: NavItem[] = [
  {
    title: "Calendar",
    href: "/calendar",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Focus",
    href: "/focus",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    title: "Insights",
    href: "/insights",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: "Notes",
    href: "/notes",
    icon: <StickyNote className="h-5 w-5" />,
  },
];

const bottomNav: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-border-primary bg-bg-secondary h-screen sticky top-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border-primary">
        <h1 className="text-xl font-bold tracking-tight text-text-primary">
          NEXUS
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Primary Navigation */}
        <div className="space-y-1">
          {primaryNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              isActive={pathname === item.href}
            >
              {item.icon}
              <span>{item.title}</span>
              {item.badge !== undefined && (
                <span className="ml-auto text-xs font-medium text-text-tertiary">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>
        
        {/* Secondary Navigation */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-xs font-medium text-text-tertiary uppercase tracking-wider">
            Organize
          </div>
          {secondaryNav.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              isActive={pathname === item.href}
            >
              {item.icon}
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>
      </nav>
      
      {/* Bottom Navigation */}
      <div className="p-3 border-t border-border-primary">
        {bottomNav.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            isActive={pathname === item.href}
          >
            {item.icon}
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

interface NavLinkProps {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}

function NavLink({ href, isActive, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        "hover:bg-bg-tertiary",
        isActive
          ? "bg-bg-tertiary text-text-primary"
          : "text-text-secondary hover:text-text-primary"
      )}
    >
      {children}
    </Link>
  );
}
