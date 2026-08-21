"use client";

import { format } from "date-fns";
import type { ActivityEvent } from "@/domain/types";

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-text-tertiary">No activity yet.</p>;
  }
  return (
    <ol className="space-y-3">
      {events.slice(0, 20).map((event) => (
        <li key={event.id} className="text-sm">
          <div className="text-text-primary">{event.message}</div>
          <div className="text-xs text-text-tertiary">
            {format(event.createdAt, "MMM d · h:mm a")}
          </div>
        </li>
      ))}
    </ol>
  );
}
