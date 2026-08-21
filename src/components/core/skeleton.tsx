import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-bg-tertiary", className)}
      aria-hidden
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="px-6 py-8 space-y-6 max-w-3xl" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
