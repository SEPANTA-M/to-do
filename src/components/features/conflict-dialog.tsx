"use client";

import { format } from "date-fns";
import { Button } from "@/components/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog";
import { describeConflicts } from "@/domain/task/conflicts";
import { getTaskDurationMinutes } from "@/domain/task/time";
import type { PendingConflict } from "@/state/ui-store";

interface ConflictDialogProps {
  conflict: PendingConflict | null;
  onKeepOverlap: () => void;
  onCancel: () => void;
  onMoveLater: () => void;
  onResizeToFit: () => void;
}

export function ConflictDialog({
  conflict,
  onKeepOverlap,
  onCancel,
  onMoveLater,
  onResizeToFit,
}: ConflictDialogProps) {
  if (!conflict) return null;

  const explanation = describeConflicts(conflict.proposed, conflict.conflicts);
  const duration = getTaskDurationMinutes(conflict.proposed);

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Schedule conflict</DialogTitle>
          <DialogDescription>
            “{conflict.proposed.title}” overlaps another item. Nothing was overwritten.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <p className="text-text-secondary">{explanation}</p>
          <ul className="rounded-md border border-border-primary divide-y divide-border-primary">
            {conflict.conflicts.map((task) => (
              <li key={task.id} className="px-3 py-2">
                <div className="font-medium text-text-primary">{task.title}</div>
                <div className="text-xs text-text-tertiary">
                  {task.startTime ? format(task.startTime, "h:mm a") : "Unscheduled"}
                  {task.endTime ? ` – ${format(task.endTime, "h:mm a")}` : ""}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-text-tertiary">
            Proposed duration: {duration} min
          </p>
        </div>

        <DialogFooter className="gap-2 sm:flex-col sm:space-x-0">
          <Button onClick={onMoveLater}>Move task</Button>
          <Button variant="secondary" onClick={onResizeToFit}>
            Resize task
          </Button>
          <Button variant="ghost" onClick={onKeepOverlap}>
            Keep overlap
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
