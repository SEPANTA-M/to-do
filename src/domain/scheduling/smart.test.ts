import { describe, expect, it } from "vitest";
import { createTask } from "@/domain/task/factory";
import { createCalendarEvent } from "@/domain/calendar/factory";
import { occupiedForDay } from "@/domain/calendar/occupancy";
import {
  describeSlot,
  findFreeSlots,
  suggestPlacements,
} from "./smart";

describe("smart scheduling", () => {
  const day = new Date("2026-08-21T00:00:00");

  it("finds 90 minutes between 16:00 and 18:00", () => {
    const morning = createTask({
      title: "Deep work",
      startTime: new Date("2026-08-21T09:00:00"),
      estimatedDuration: 120,
      status: "planned",
    });
    const evening = createTask({
      title: "Review",
      startTime: new Date("2026-08-21T18:00:00"),
      estimatedDuration: 60,
      status: "planned",
    });
    const event = createCalendarEvent({
      title: "Call",
      startTime: new Date("2026-08-21T14:00:00"),
      endTime: new Date("2026-08-21T16:00:00"),
    });
    const occupied = occupiedForDay([morning, evening], [event], day);
    const slots = findFreeSlots(day, occupied, {
      dayStartHour: 9,
      dayEndHour: 19,
      minDuration: 15,
    });
    const match = slots.find(
      (slot) => slot.start.getHours() === 16 && slot.end.getHours() === 18
    );
    expect(match?.durationMinutes).toBe(120);
    const ninety = slots.find((slot) => slot.durationMinutes >= 90);
    expect(ninety).toBeTruthy();
    expect(describeSlot({
      start: new Date("2026-08-21T16:00:00"),
      end: new Date("2026-08-21T18:00:00"),
      durationMinutes: 90,
    })).toBe("You have 90 minutes available between 16:00 and 18:00.");
  });

  it("suggests a placement without mutating the original schedule", () => {
    const open = createTask({
      title: "Write report",
      estimatedDuration: 45,
      priority: "high",
      dueDate: new Date("2026-08-21T20:00:00"),
    });
    const slots = findFreeSlots(day, [], {
      dayStartHour: 16,
      dayEndHour: 18,
      minDuration: 15,
    });
    const suggestions = suggestPlacements([open], slots);
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0]?.slot.start.getHours()).toBe(16);
    expect(open.startTime).toBeUndefined();
  });

  it("does not place a task into a slot shorter than its duration", () => {
    const long = createTask({
      title: "Long block",
      estimatedDuration: 180,
    });
    const slots = findFreeSlots(day, [], {
      dayStartHour: 16,
      dayEndHour: 18,
      minDuration: 15,
    });
    expect(suggestPlacements([long], slots)).toHaveLength(0);
  });
});
