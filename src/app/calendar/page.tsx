import { Calendar } from "lucide-react";
import { EmptyState } from "@/components/core/empty-state";

export default function CalendarPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Calendar
        </h1>
        <p className="text-sm text-text-secondary">
          View and manage your schedule
        </p>
      </header>
      
      <EmptyState
        icon={<Calendar className="h-16 w-16" />}
        title="No events scheduled"
        description="Your calendar is empty. Add events to organize your time."
      />
    </div>
  );
}
