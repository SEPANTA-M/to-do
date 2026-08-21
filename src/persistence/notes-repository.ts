import type { Note } from "@/domain/types";
import { deserializeNote, serializeNote } from "@/domain/note/serialize";
import { getDefaultStorage, type KeyValueStorage } from "./storage";
import { parseArray } from "./json";

const NOTES_KEY = "nexus.notes";

export class NotesRepository {
  constructor(private readonly storage: KeyValueStorage = getDefaultStorage()) {}

  async load(): Promise<Note[]> {
    const raw = await this.storage.getItem(NOTES_KEY);
    return parseArray(raw, deserializeNote);
  }

  async save(notes: Note[]): Promise<void> {
    await this.storage.setItem(NOTES_KEY, JSON.stringify(notes.map(serializeNote)));
  }
}
