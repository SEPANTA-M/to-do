"use client";

import { useParams } from "next/navigation";
import { ProjectDetail } from "@/components/features/project-detail";
import { useWorkspaceStore } from "@/state/workspace-store";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const hydrated = useWorkspaceStore((state) => state.hydrated);

  if (!hydrated) {
    return <div className="px-5 py-10"><span className="label-caps">Loading</span></div>;
  }
  if (!id) {
    return (
      <div className="px-5 py-10 text-sm text-text-secondary">This project is not available.</div>
    );
  }
  return <ProjectDetail key={id} projectId={id} />;
}
