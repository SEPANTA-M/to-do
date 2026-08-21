"use client";

import { Button } from "@/components/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives/dialog";

interface ConfirmArchiveProps {
  open: boolean;
  title: string;
  description: string;
  unlinkLabel?: string;
  onArchive: () => void;
  onUnlink?: () => void;
  onCancel: () => void;
}

export function ConfirmArchive({
  open,
  title,
  description,
  unlinkLabel,
  onArchive,
  onUnlink,
  onCancel,
}: ConfirmArchiveProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-text-secondary">
          Child items are not deleted. You can keep the links or detach them.
        </p>
        <DialogFooter className="gap-2 sm:flex-col sm:space-x-0">
          <Button onClick={onArchive}>Archive</Button>
          {onUnlink && unlinkLabel ? (
            <Button variant="secondary" onClick={onUnlink}>
              {unlinkLabel}
            </Button>
          ) : null}
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
