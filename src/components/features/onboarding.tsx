"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/primitives/button";
import { useSettingsStore } from "@/state/settings-store";
import { useUiStore } from "@/state/ui-store";
import { useTaskStore } from "@/state/task-store";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useT } from "@/i18n/use-t";

export function Onboarding() {
  const settings = useSettingsStore((s) => s.settings);
  const hydrated = useSettingsStore((s) => s.hydrated);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const openComposer = useUiStore((s) => s.openComposer);
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useWorkspaceStore((s) => s.projects);
  const goals = useWorkspaceStore((s) => s.goals);
  const router = useRouter();
  const t = useT();
  const [dismissed, setDismissed] = React.useState(false);

  const hasTask = tasks.length > 0;
  const hasScheduled = tasks.some((task) => Boolean(task.startTime));
  const hasProject = projects.length > 0;
  const hasGoal = goals.length > 0;
  const finished = hasTask && hasScheduled && hasProject && hasGoal;

  React.useEffect(() => {
    if (!hydrated || settings.onboardingCompleted || dismissed || !finished) return;
    void completeOnboarding();
  }, [hydrated, settings.onboardingCompleted, dismissed, finished, completeOnboarding]);

  if (!hydrated || settings.onboardingCompleted || dismissed || finished) return null;

  return (
    <section className="mx-5 mt-4 lg:mx-10 max-w-3xl border border-border-primary rounded-md px-4 py-4 bg-bg-elevated">
      <p className="label-caps mb-2">{t("onboarding.title")}</p>
      <p className="text-sm text-text-secondary mb-4">
        {t("onboarding.body")}
      </p>
      <ol className="space-y-2 text-sm text-text-primary mb-4">
        <Step done={hasTask} label={t("onboarding.task")} action={() => openComposer()} actionLabel={t("action.capture")} />
        <Step
          done={hasScheduled}
          label={t("onboarding.schedule")}
          action={() => router.push("/")}
          actionLabel={t("nav.today")}
        />
        <Step
          done={hasProject}
          label={t("onboarding.project")}
          action={() => router.push("/projects")}
          actionLabel={t("nav.projects")}
        />
        <Step
          done={hasGoal}
          label={t("onboarding.goal")}
          action={() => router.push("/goals")}
          actionLabel={t("nav.goals")}
        />
      </ol>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setDismissed(true);
            void completeOnboarding();
          }}
        >
          {t("action.skip")}
        </Button>
      </div>
    </section>
  );
}

function Step({
  done,
  label,
  action,
  actionLabel,
}: {
  done: boolean;
  label: string;
  action: () => void;
  actionLabel: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className={done ? "text-text-tertiary" : "text-text-primary"}>
        {done ? "✓" : "○"} {label}
      </span>
      {!done && (
        <Button size="sm" variant="secondary" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </li>
  );
}
