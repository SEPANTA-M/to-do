import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/core/empty-state";

export default function InsightsPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Insights
        </h1>
        <p className="text-sm text-text-secondary">
          Analytics and productivity metrics
        </p>
      </header>
      
      <EmptyState
        icon={<BarChart3 className="h-16 w-16" />}
        title="No data yet"
        description="Complete tasks and focus sessions to see your productivity insights."
      />
    </div>
  );
}
