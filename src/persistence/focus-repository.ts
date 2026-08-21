import type { FocusSession } from "@/domain/types";
import { deserializeFocus, serializeFocus } from "@/domain/focus/serialize";
import { getDefaultStorage, type KeyValueStorage } from "./storage";
import { parseArray } from "./json";

const SESSIONS_KEY = "nexus.focus-sessions";

export class FocusRepository {
  constructor(private readonly storage: KeyValueStorage = getDefaultStorage()) {}

  async load(): Promise<FocusSession[]> {
    const raw = await this.storage.getItem(SESSIONS_KEY);
    return parseArray(raw, deserializeFocus);
  }

  async save(sessions: FocusSession[]): Promise<void> {
    await this.storage.setItem(SESSIONS_KEY, JSON.stringify(sessions.map(serializeFocus)));
  }
}
