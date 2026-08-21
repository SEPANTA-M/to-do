import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 mb-4", className)}>
      <h2 className="label-caps">{children}</h2>
      <div className="hairline flex-1" />
    </div>
  );
}
