"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  ListTodo,
  FolderKanban,
  Zap,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const mobileNav: NavItem[] = [
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
    title: "Focus",
    href: "/focus",
    icon: <Zap className="h-5 w-5" />,
  },
  {
    title: "More",
    href: "/menu",
    icon: <Menu className="h-5 w-5" />,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border-primary bg-bg-elevated">
      <div className="grid grid-cols-5 h-16">
        {mobileNav.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-interactive-primary"
                  : "text-text-tertiary hover:text-text-primary"
              )}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
