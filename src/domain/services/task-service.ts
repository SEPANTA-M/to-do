/**
 * Compatibility facade.
 * Phase 1 persistence is local-first (see src/persistence and src/state/task-store).
 * Domain operations live in src/domain/task — this file re-exports them so
 * existing imports keep working without a second implementation.
 */

export {
  applyArchive,
  applyComplete,
  applyCreate,
  applyDelete,
  applyDuplicate,
  applyPause,
  applyReorder,
  applyReschedule,
  applyResize,
  applyStart,
  applyUpdate,
  conflictsFor,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/domain/task/service";

export { detectConflicts, getCurrentTask } from "@/domain/task";
