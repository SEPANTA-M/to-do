import Link from "next/link";
import { Button } from "@/components/primitives/button";

export default function OfflinePage() {
  return (
    <div className="container max-w-lg mx-auto px-5 py-16">
      <p className="label-caps mb-3">Offline</p>
      <h1 className="text-xl font-medium tracking-tight text-text-primary mb-3">
        You are offline.
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        NEXUS keeps working from this device. Open Today to continue.
      </p>
      <Button asChild>
        <Link href="/">Today</Link>
      </Button>
    </div>
  );
}
