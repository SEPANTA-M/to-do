import type { CSSProperties } from "react";

/** Opaque popup fill — never glass. */
export const PANEL_STYLE: CSSProperties = {
  backgroundColor: "var(--panel)",
  color: "var(--ink)",
  opacity: 1,
  isolation: "isolate",
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
};

export const FIELD_STYLE: CSSProperties = {
  backgroundColor: "var(--field)",
  color: "var(--ink)",
  caretColor: "var(--ink)",
  opacity: 1,
};

export const SCRIM_STYLE: CSSProperties = {
  backgroundColor: "rgba(0, 0, 0, 0.55)",
  opacity: 1,
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
};

export const PANEL_CLASS =
  "bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50";

export const FIELD_CLASS =
  "bg-neutral-100 text-neutral-950 dark:bg-black dark:text-neutral-50";

/**
 * Injected as a raw <style> in the document so Tailwind cannot strip it.
 * Light = solid white, dark = solid black. Fields stay readable.
 */
export const CRITICAL_POPUP_CSS = `
:root, html.light {
  --panel: #ffffff;
  --field: #eeeeee;
  --ink: #111111;
  color-scheme: light;
}
html.dark {
  --panel: #111111;
  --field: #000000;
  --ink: #f5f5f5;
  color-scheme: dark;
}
html { background-color: #ffffff; color: #111111; }
html.dark { background-color: #000000; color: #f5f5f5; }

[role="dialog"],
[data-radix-dialog-content],
[data-radix-select-content],
[data-radix-popper-content-wrapper] > *,
[cmdk-dialog],
[data-nexus-panel] {
  background-color: #ffffff !important;
  color: #111111 !important;
  opacity: 1 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

html.dark [role="dialog"],
html.dark [data-radix-dialog-content],
html.dark [data-radix-select-content],
html.dark [data-radix-popper-content-wrapper] > *,
html.dark [cmdk-dialog],
html.dark [data-nexus-panel] {
  background-color: #111111 !important;
  color: #f5f5f5 !important;
}

[role="dialog"] input,
[role="dialog"] textarea,
[role="dialog"] select,
[data-nexus-panel] input,
[data-nexus-panel] textarea,
[data-nexus-panel] select,
[data-radix-dialog-content] input,
[data-radix-dialog-content] textarea,
[data-radix-dialog-content] select,
[cmdk-input] {
  background-color: #eeeeee !important;
  color: #111111 !important;
  caret-color: #111111 !important;
  opacity: 1 !important;
}

html.dark [role="dialog"] input,
html.dark [role="dialog"] textarea,
html.dark [role="dialog"] select,
html.dark [data-nexus-panel] input,
html.dark [data-nexus-panel] textarea,
html.dark [data-nexus-panel] select,
html.dark [data-radix-dialog-content] input,
html.dark [data-radix-dialog-content] textarea,
html.dark [data-radix-dialog-content] select,
html.dark [cmdk-input] {
  background-color: #000000 !important;
  color: #f5f5f5 !important;
  caret-color: #f5f5f5 !important;
}

[role="dialog"] input::placeholder,
[role="dialog"] textarea::placeholder,
[data-nexus-panel] input::placeholder,
[data-nexus-panel] textarea::placeholder,
[cmdk-input]::placeholder {
  color: #666666 !important;
  opacity: 1 !important;
}

html.dark [role="dialog"] input::placeholder,
html.dark [role="dialog"] textarea::placeholder,
html.dark [data-nexus-panel] input::placeholder,
html.dark [data-nexus-panel] textarea::placeholder,
html.dark [cmdk-input]::placeholder {
  color: #9a9a9a !important;
  opacity: 1 !important;
}

[data-nexus-scrim],
[cmdk-overlay],
[data-radix-dialog-overlay] {
  background-color: rgba(0, 0, 0, 0.55) !important;
  opacity: 1 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
`;
