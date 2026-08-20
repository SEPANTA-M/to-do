import type { TaskPriority, TaskRecurrence } from "@/domain/types";

/**
 * Result of parsing natural-language task input.
 * Unrecognized text remains in `title`.
 */
export interface ParsedTaskInput {
  title: string;
  dueDate?: Date;
  startTime?: Date;
  estimatedDuration?: number;
  priority?: TaskPriority;
  tags?: string[];
  recurrence?: TaskRecurrence;
  remainder: string;
}

/**
 * Parser interface. Phase 1 ships a deterministic local implementation.
 * A future AI implementation can satisfy the same contract.
 */
export interface TaskParser {
  parse(input: string, now?: Date): ParsedTaskInput;
}
