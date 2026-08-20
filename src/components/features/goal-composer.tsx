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
import type { AccentToken, TaskPriority } from "@/domain/types";
import type { CreateGoalInput } from "@/domain/goal/factory";

const ICONS = ["target", "flag", "rocket", "compass", "mountain"] as const;
const ACCENTS: AccentToken[] = ["purple", "pink", "orange", "teal", "indigo"];

export function GoalComposer({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateGoalInput) => Promise<void> | void;
}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [targetDate, setTargetDate] = React.useState("");
  const [priority, setPriority] = React.useState<TaskPriority>("medium");
  const [icon, setIcon] = React.useState<string>("target");
  const [accent, setAccent] = React.useState<AccentToken>("indigo");
  const [details, setDetails] = React.useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;
    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate ? new Date(`${targetDate}T00:00:00`) : undefined,
      priority,
      icon,
      accent,
      status: "active",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>New goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-title">Goal name</Label>
            <Input
              id="goal-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What are you working toward?"
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
                <Label htmlFor="goal-desc">Description</Label>
                <Textarea
                  id="goal-desc"
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="goal-date">Target date</Label>
                  <Input
                    id="goal-date"
                    type="date"
                    value={targetDate}
                    onChange={(event) => setTargetDate(event.target.value)}
                  />
                </div>
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
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select value={icon} onValueChange={setIcon}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICONS.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Accent</Label>
                  <Select value={accent} onValueChange={(v) => setAccent(v as AccentToken)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCENTS.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Create goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
