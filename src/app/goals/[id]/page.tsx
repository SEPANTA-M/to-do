"use client";

import { useParams } from "next/navigation";
import { GoalDetail } from "@/components/features/goal-detail";
import { useWorkspaceStore } from "@/state/workspace-store";

export default function GoalDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const hydrated = useWorkspaceStore((state) => state.hydrated);

  if (!hydrated) {
    return <div className="px-5 py-10"><span className="label-caps">Loading</span></div>;
  }
  if (!id) {
    return (
      <div className="px-5 py-10 text-sm text-text-secondary">This goal is not available.</div>
    );
  }
  return <GoalDetail key={id} goalId={id} />;
}
