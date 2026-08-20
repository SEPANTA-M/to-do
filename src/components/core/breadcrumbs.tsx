"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ crumbs, className }: { crumbs: Crumb[]; className?: string }) {
  if (crumbs.length === 0) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("hidden lg:flex items-center gap-1 text-xs text-text-tertiary min-w-0", className)}
    >
      {crumbs.map((crumb, index) => {
        const last = index === crumbs.length - 1;
        return (
          <span key={`${crumb.label}-${index}`} className="flex items-center gap-1 min-w-0">
            {index > 0 && <ChevronRight className="h-3 w-3 flex-shrink-0" />}
            {crumb.href && !last ? (
              <Link href={crumb.href} className="hover:text-text-primary truncate">
                {crumb.label}
              </Link>
            ) : (
              <span className={cn("truncate", last && "text-text-secondary")}>{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function CompactContext({
  label,
  href,
}: {
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="lg:hidden text-xs text-text-secondary hover:text-text-primary"
    >
      ← {label}
    </Link>
  );
}
