"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/primitives/button";
import { useUiStore } from "@/state/ui-store";

export function QuickCapture() {
  const openComposer = useUiStore((state) => state.openComposer);
  const composerOpen = useUiStore((state) => state.composerOpen);

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "n" && event.key !== "N") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
        return;
      }
      event.preventDefault();
      openComposer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openComposer]);

  return (
    <Button
      size="icon"
      className="lg:hidden fixed right-4 bottom-20 z-40 h-12 w-12 rounded-full shadow-md"
      onClick={() => openComposer()}
      aria-label="Create task"
      aria-expanded={composerOpen}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
