import type { ActivityEvent, ActivityType } from "@/domain/types";
import { createId } from "@/domain/ids";

export function recordActivity(
  type: ActivityType,
  entityType: ActivityEvent["entityType"],
  entityId: string,
  message: string,
  now: Date = new Date()
): ActivityEvent {
  return {
    id: createId("act"),
    type,
    entityType,
    entityId,
    message,
    createdAt: now,
  };
}

export function activityForEntity(
  events: ActivityEvent[],
  entityId: string,
  relatedIds: string[] = []
): ActivityEvent[] {
  const ids = new Set([entityId, ...relatedIds]);
  return events
    .filter((event) => ids.has(event.entityId))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
