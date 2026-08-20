import { create } from "zustand";
import type { Note } from "@/domain/types";
import { applyNoteUpdate, createNote, type CreateNoteInput, type UpdateNoteInput } from "@/domain/note/factory";
import { NotesRepository } from "@/persistence/notes-repository";
import { logError } from "@/lib/logger";

interface NotesState {
  notes: Note[];
  hydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, updates: UpdateNoteInput) => Promise<Note | null>;
  archiveNote: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  replaceAll: (notes: Note[]) => Promise<void>;
}

const repository = new NotesRepository();

async function persist(notes: Note[]): Promise<void> {
  try {
    await repository.save(notes);
  } catch (error) {
    logError("Unable to save notes", "notes.persist");
    useNotesStore.setState({
      error: error instanceof Error ? error.message : "Unable to save notes",
    });
  }
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  hydrated: false,
  error: null,

  hydrate: async () => {
    try {
      const notes = await repository.load();
      set({ notes, hydrated: true, error: null });
    } catch {
      set({ hydrated: true });
    }
  },

  createNote: async (input) => {
    const note = createNote(input);
    const notes = [...get().notes, note];
    set({ notes, error: null });
    await persist(notes);
    return note;
  },

  updateNote: async (id, updates) => {
    const current = get().notes.find((note) => note.id === id);
    if (!current) return null;
    const next = applyNoteUpdate(current, updates);
    const notes = get().notes.map((note) => (note.id === id ? next : note));
    set({ notes });
    await persist(notes);
    return next;
  },

  archiveNote: async (id) => {
    await get().updateNote(id, { archived: true });
  },

  deleteNote: async (id) => {
    const notes = get().notes.filter((note) => note.id !== id);
    set({ notes });
    await persist(notes);
  },

  replaceAll: async (notes) => {
    set({ notes });
    await persist(notes);
  },
}));
