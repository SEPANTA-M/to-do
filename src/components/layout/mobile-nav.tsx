"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, ListTodo, FolderKanban, Target, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/use-t";

export function MobileNav() {
  const pathname = usePathname();
  const t = useT();
  const mobileNav = [
    { title: t("nav.today"), href: "/", icon: Inbox },
    { title: t("nav.tasks"), href: "/tasks", icon: ListTodo },
    { title: t("nav.projects"), href: "/projects", icon: FolderKanban },
    { title: t("nav.goals"), href: "/goals", icon: Target },
    { title: t("nav.menu"), href: "/menu", icon: Menu },
  ];

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
                "flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors duration-fast",
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
