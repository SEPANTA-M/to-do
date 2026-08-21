import { describe, expect, it } from "vitest";
import { parseTaskText } from "./parser";

describe("natural language parser", () => {
  const now = new Date("2026-08-20T09:00:00");

  it("parses the physics homework example", () => {
    const parsed = parseTaskText(
      "Finish physics homework tomorrow at 7pm for 60 minutes",
      now
    );
    expect(parsed.title).toBe("Finish physics homework");
    expect(parsed.estimatedDuration).toBe(60);
    expect(parsed.startTime?.getHours()).toBe(19);
    expect(parsed.startTime?.getMinutes()).toBe(0);
    expect(parsed.startTime?.getDate()).toBe(21);
    expect(parsed.startTime?.getMonth()).toBe(7);
  });

  it("parses today and priority", () => {
    const parsed = parseTaskText("Call dentist today at 3pm high priority", now);
    expect(parsed.title).toBe("Call dentist");
    expect(parsed.priority).toBe("high");
    expect(parsed.startTime?.getHours()).toBe(15);
    expect(parsed.startTime?.getDate()).toBe(20);
  });

  it("leaves unrecognized text in the title", () => {
    const parsed = parseTaskText("Think about the architecture", now);
    expect(parsed.title).toBe("Think about the architecture");
    expect(parsed.startTime).toBeUndefined();
    expect(parsed.estimatedDuration).toBeUndefined();
  });

  it("extracts tags", () => {
    const parsed = parseTaskText("Draft outline #writing #deep", now);
    expect(parsed.title).toBe("Draft outline");
    expect(parsed.tags).toEqual(["writing", "deep"]);
  });
});
