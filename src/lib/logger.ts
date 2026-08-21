/**
 * Structured logging without secrets or payload dumps.
 * Swap `emit` in production to forward to an external monitor.
 */

type LogLevel = "info" | "warn" | "error";

export interface LogEvent {
  level: LogLevel;
  message: string;
  code?: string;
  at: string;
}

type Sink = (event: LogEvent) => void;

let sink: Sink = (event) => {
  if (process.env.NODE_ENV === "test") return;
  const line = `[nexus ${event.level}] ${event.message}${event.code ? ` (${event.code})` : ""}`;
  if (event.level === "error") console.error(line);
  else if (event.level === "warn") console.warn(line);
  else console.info(line);
};

export function setLogSink(next: Sink): void {
  sink = next;
}

export function logInfo(message: string, code?: string): void {
  sink({ level: "info", message, code, at: new Date().toISOString() });
}

export function logWarn(message: string, code?: string): void {
  sink({ level: "warn", message, code, at: new Date().toISOString() });
}

export function logError(message: string, code?: string): void {
  sink({ level: "error", message, code, at: new Date().toISOString() });
}

export function toUserError(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof Error && error.message && !/sql|password|token|secret/i.test(error.message)) {
    return error.message;
  }
  return fallback;
}
