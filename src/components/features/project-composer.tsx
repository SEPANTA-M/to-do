"use client";

import * as React from "react";
import { Button } from "@/components/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import { Label } from "@/components/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/primitives/select";
import type { TaskPriority } from "@/domain/types";
import type { CreateProjectInput } from "@/domain/project/factory";
import { HierarchyPicker, type HierarchyValue } from "./hierarchy-picker";
import { useWorkspaceStore } from "@/state/workspace-store";

export function ProjectComposer({
  open,
  onOpenChange,
  onSubmit,
  preset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateProjectInput) => Promise<void> | void;
  preset?: HierarchyValue;
}) {
  const goals = useWorkspaceStore((s) => s.goals);
  const milestones = useWorkspaceStore((s) => s.milestones);
  const projects = useWorkspaceStore((s) => s.projects);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [startDate, setStartDate] = React.useState("");
  const [targetDate, setTargetDate] = React.useState("");
  const [hierarchy, setHierarchy] = React.useState<HierarchyValue>(preset ?? {});
  const [details, setDetails] = React.useState(Boolean(preset?.goalId));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      priority,
      startDate: startDate ? new Date(`${startDate}T00:00:00`) : undefined,
      targetDate: targetDate ? new Date(`${targetDate}T00:00:00`) : undefined,
      goalId: hierarchy.goalId,
      milestoneId: hierarchy.milestoneId,
      status: "active",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="What are you building?"
              autoFocus
            />
          </div>
          {!details && (
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => setDetails(true)}>
              Add details
            </Button>
          )}
          {details && (
            <div className="space-y-3 border-t border-border-primary pt-3">
              <div className="space-y-2">
                <Label htmlFor="project-desc">Description</Label>
                <Textarea
                  id="project-desc"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <HierarchyPicker
                goals={goals}
                milestones={milestones}
                projects={projects}
                value={hierarchy}
                onChange={setHierarchy}
                showProject={false}
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-start">Start date</Label>
                  <Input
                    id="project-start"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-target">Target date</Label>
                <Input
                  id="project-target"
                  type="date"
                  value={targetDate}
                  onChange={(event) => setTargetDate(event.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
