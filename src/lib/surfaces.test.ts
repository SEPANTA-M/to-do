import { describe, expect, it } from "vitest";
import { CRITICAL_POPUP_CSS } from "./surfaces";

describe("opaque popup lock", () => {
  it("forces dialogs to solid white or black with no glass", () => {
    expect(CRITICAL_POPUP_CSS).toContain("background-color: #ffffff !important");
    expect(CRITICAL_POPUP_CSS).toContain("background-color: #111111 !important");
    expect(CRITICAL_POPUP_CSS).toContain('[role="dialog"]');
    expect(CRITICAL_POPUP_CSS).toContain("[cmdk-dialog]");
    expect(CRITICAL_POPUP_CSS).not.toContain("backdrop-filter: blur");
  });
});
