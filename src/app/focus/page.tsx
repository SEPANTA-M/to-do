import { Zap } from "lucide-react";
import { EmptyState } from "@/components/core/empty-state";
import { Button } from "@/components/primitives/button";

export default function FocusPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Focus Mode
        </h1>
        <p className="text-sm text-text-secondary">
          Deep work sessions to maximize productivity
        </p>
      </header>
      
      <EmptyState
        icon={<Zap className="h-16 w-16" />}
        title="Ready to focus"
        description="Start a focus session to track your deep work time and build momentum."
        action={
          <Button variant="primary">
            Start Focus Session
          </Button>
        }
      />
    </div>
  );
}
