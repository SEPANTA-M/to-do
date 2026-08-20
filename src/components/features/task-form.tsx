"use client";

import * as React from "react";
import { Plus, Calendar, Clock, Tag } from "lucide-react";
import { Button } from "@/components/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import type { TaskPriority, TaskStatus } from "@/domain/types";
import { format } from "date-fns";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => void;
  initialData?: Partial<TaskFormData>;
  defaultDate?: Date;
  defaultTime?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  scheduledDate?: Date;
  startTime?: Date;
  estimatedDuration?: number;
}

export function TaskForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  defaultDate,
  defaultTime,
}: TaskFormProps) {
  const [title, setTitle] = React.useState(initialData?.title || "");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [priority, setPriority] = React.useState<TaskPriority>(
    initialData?.priority || "medium"
  );
  const [status, setStatus] = React.useState<TaskStatus>(
    initialData?.status || "inbox"
  );
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [dueDate, setDueDate] = React.useState(
    initialData?.dueDate ? format(initialData.dueDate, "yyyy-MM-dd") : ""
  );
  const [startTime, setStartTime] = React.useState(
    defaultTime || (initialData?.startTime ? format(initialData.startTime, "HH:mm") : "")
  );
  const [estimatedDuration, setEstimatedDuration] = React.useState(
    initialData?.estimatedDuration?.toString() || "30"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const formData: TaskFormData = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      status,
    };

    // Handle due date
    if (dueDate) {
      formData.dueDate = new Date(dueDate);
    }

    // Handle start time
    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startDate = defaultDate || (dueDate ? new Date(dueDate) : new Date());
      startDate.setHours(hours, minutes, 0, 0);
      formData.startTime = startDate;
      formData.scheduledDate = startDate;

      // Calculate end time if duration is provided
      if (estimatedDuration) {
        const duration = parseInt(estimatedDuration, 10);
        formData.estimatedDuration = duration;
      }
    }

    onSubmit(formData);
    
    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("inbox");
    setDueDate("");
    setStartTime("");
    setEstimatedDuration("30");
    setShowAdvanced(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Task title</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Quick options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
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
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbox">Inbox</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Advanced toggle */}
          {!showAdvanced && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(true)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add details
            </Button>
          )}

          {/* Advanced fields */}
          {showAdvanced && (
            <div className="space-y-4 pt-2 border-t border-border-primary">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add more details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Due date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">
                    <Clock className="inline h-3 w-3 mr-1" />
                    Start time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>

              {startTime && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    step="5"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
