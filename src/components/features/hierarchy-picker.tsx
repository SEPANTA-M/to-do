"use client";

import type { Goal, Milestone, Project } from "@/domain/types";
import { useT } from "@/i18n/use-t";
import { Label } from "@/components/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select";

const NONE = "__none__";

export interface HierarchyValue {
  goalId?: string;
  milestoneId?: string;
  projectId?: string;
}

export function HierarchyPicker({
  goals,
  milestones,
  projects,
  value,
  onChange,
  allowEmptyProject = true,
  showProject = true,
}: {
  goals: Goal[];
  milestones: Milestone[];
  projects: Project[];
  value: HierarchyValue;
  onChange: (next: HierarchyValue) => void;
  allowEmptyProject?: boolean;
  showProject?: boolean;
}) {
  const t = useT();
  const visibleGoals = goals.filter((goal) => goal.status !== "archived");
  const visibleMilestones = milestones.filter(
    (milestone) =>
      milestone.status !== "archived" &&
      (!value.goalId || milestone.goalId === value.goalId)
  );
  const visibleProjects = projects.filter((project) => {
    if (project.status === "archived") return false;
    if (value.milestoneId) return project.milestoneId === value.milestoneId;
    if (value.goalId) return project.goalId === value.goalId;
    return true;
  });

  const selectGoal = (raw: string) => {
    const goalId = raw === NONE ? undefined : raw;
    onChange({ goalId, milestoneId: undefined, projectId: undefined });
  };

  const selectMilestone = (raw: string) => {
    const milestoneId = raw === NONE ? undefined : raw;
    if (!milestoneId) {
      onChange({ ...value, milestoneId: undefined, projectId: undefined });
      return;
    }
    const milestone = milestones.find((item) => item.id === milestoneId);
    onChange({
      goalId: milestone?.goalId ?? value.goalId,
      milestoneId,
      projectId: undefined,
    });
  };

  const selectProject = (raw: string) => {
    const projectId = raw === NONE ? undefined : raw;
    if (!projectId) {
      onChange({ ...value, projectId: undefined });
      return;
    }
    const project = projects.find((item) => item.id === projectId);
    onChange({
      projectId,
      milestoneId: project?.milestoneId,
      goalId: project?.goalId ?? value.goalId,
    });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>{t("field.goal")}</Label>
        <Select value={value.goalId ?? NONE} onValueChange={selectGoal}>
          <SelectTrigger>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>{t("field.none")}</SelectItem>
            {visibleGoals.map((goal) => (
              <SelectItem key={goal.id} value={goal.id}>
                {goal.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{t("field.milestone")}</Label>
        <Select
          value={value.milestoneId ?? NONE}
          onValueChange={selectMilestone}
          disabled={!value.goalId}
        >
          <SelectTrigger>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE}>{t("field.none")}</SelectItem>
            {visibleMilestones.map((milestone) => (
              <SelectItem key={milestone.id} value={milestone.id}>
                {milestone.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {showProject && (
      <div className="space-y-2">
        <Label>Project</Label>
        <Select
          value={value.projectId ?? NONE}
          onValueChange={selectProject}
        >
          <SelectTrigger>
            <SelectValue placeholder={allowEmptyProject ? "None" : "Select"} />
          </SelectTrigger>
          <SelectContent>
            {allowEmptyProject && <SelectItem value={NONE}>{t("field.none")}</SelectItem>}
            {visibleProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      )}
    </div>
  );
}
