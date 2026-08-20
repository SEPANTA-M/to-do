import { StickyNote } from "lucide-react";
import { EmptyState } from "@/components/core/empty-state";

export default function NotesPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Notes
        </h1>
        <p className="text-sm text-text-secondary">
          Quick capture and reference
        </p>
      </header>
      
      <EmptyState
        icon={<StickyNote className="h-16 w-16" />}
        title="No notes yet"
        description="Create notes to capture ideas, reminders, and important information."
      />
    </div>
  );
}
