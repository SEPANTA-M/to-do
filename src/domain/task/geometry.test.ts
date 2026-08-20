import { describe, expect, it } from "vitest";
import { createTask } from "./factory";
import { createDayFlowLayout, getBlockGeometry, yToMinutes } from "./geometry";
import { moveTaskToStart } from "./scheduling";

describe("day flow calculations", () => {
  it("positions a 14:00 task at the 14:00 slot", () => {
    const layout = createDayFlowLayout(15, 60);
    const task = createTask({
      title: "Afternoon",
      startTime: new Date("2026-08-20T14:00:00"),
      estimatedDuration: 60,
    });
    const geometry = getBlockGeometry(task, layout);
    expect(geometry?.startMinutes).toBe(14 * 60);
    expect(geometry?.top).toBe(14 * 60);
    expect(geometry?.durationMinutes).toBe(60);
    expect(geometry?.height).toBe(60);
  });

  it("maps a vertical move into 16:00 in the model", () => {
    const task = createTask({
      title: "Block",
      startTime: new Date("2026-08-20T14:00:00"),
      estimatedDuration: 60,
    });
    const moved = moveTaskToStart(task, new Date("2026-08-20T16:00:00"), new Date());
    expect(moved.startTime?.getHours()).toBe(16);
    expect(moved.endTime?.getHours()).toBe(17);
  });

  it("snaps pointer offsets to the granularity", () => {
    const layout = createDayFlowLayout(15, 60);
    // 14:07 should snap to 14:00 or 14:15 depending on rounding
    const minutes = yToMinutes(14 * 60 + 7, layout);
    expect(minutes % 15).toBe(0);
  });
});
