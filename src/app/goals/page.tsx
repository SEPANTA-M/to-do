import { Target } from "lucide-react";
import { EmptyState } from "@/components/core/empty-state";

export default function GoalsPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Goals
        </h1>
        <p className="text-sm text-text-secondary">
          Track your long-term objectives and milestones
        </p>
      </header>
      
      <EmptyState
        icon={<Target className="h-16 w-16" />}
        title="No goals yet"
        description="Set your first goal and break it down into actionable milestones."
      />
    </div>
  );
}
