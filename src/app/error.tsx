"use client";

import { Button } from "@/components/primitives/button";
import { logError } from "@/lib/logger";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logError("Render failed", error.digest ?? "render");
  }, [error]);

  return (
    <div className="container max-w-lg mx-auto px-5 py-16">
      <p className="label-caps mb-3">Error</p>
      <h1 className="text-xl font-medium tracking-tight text-text-primary mb-3">
        Something broke on this screen.
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        Your local changes are still on this device. Retry the screen, or return to Today.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Retry</Button>
        <Button variant="secondary" onClick={() => (window.location.href = "/")}>
          Today
        </Button>
      </div>
    </div>
  );
}
