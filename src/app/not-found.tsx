import Link from "next/link";
import { Button } from "@/components/primitives/button";

export default function NotFound() {
  return (
    <div className="container max-w-lg mx-auto px-5 py-16">
      <p className="label-caps mb-3">404</p>
      <h1 className="text-xl font-medium tracking-tight text-text-primary mb-3">
        This page is not part of NEXUS.
      </h1>
      <p className="text-sm text-text-secondary mb-6">
        The route does not exist. Your data is untouched.
      </p>
      <Button asChild>
        <Link href="/">Back to Today</Link>
      </Button>
    </div>
  );
}
