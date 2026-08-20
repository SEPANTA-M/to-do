"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, ListTodo, FolderKanban, Target, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNav = [
  { title: "Today", href: "/", icon: Inbox },
  { title: "Tasks", href: "/tasks", icon: ListTodo },
  { title: "Projects", href: "/projects", icon: FolderKanban },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "More", href: "/menu", icon: Menu },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border-primary bg-bg-elevated">
      <div className="grid grid-cols-5 h-14">
        {mobileNav.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 text-[10px] tracking-wide font-medium transition-colors duration-fast",
                isActive ? "text-interactive-primary" : "text-text-tertiary"
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.6} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
