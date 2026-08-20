import { FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/core/empty-state";

export default function ProjectsPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Projects
        </h1>
        <p className="text-sm text-text-secondary">
          Organize tasks into meaningful projects
        </p>
      </header>
      
      <EmptyState
        icon={<FolderKanban className="h-16 w-16" />}
        title="No projects yet"
        description="Create your first project to group related tasks together."
      />
    </div>
  );
}
