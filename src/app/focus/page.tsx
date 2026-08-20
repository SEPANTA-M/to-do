import { Suspense } from "react";
import { FocusView } from "@/components/features/focus-view";
import { PageSkeleton } from "@/components/core/skeleton";

export default function FocusPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FocusView />
    </Suspense>
  );
}
