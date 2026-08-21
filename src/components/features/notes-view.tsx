"use client";

import * as React from "react";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import { EmptyState } from "@/components/core/empty-state";
import { PageSkeleton } from "@/components/core/skeleton";
import { useNotesStore } from "@/state/notes-store";
import { useWorkspaceStore } from "@/state/workspace-store";
import { useTaskStore } from "@/state/task-store";
import { searchNotes } from "@/domain/search";
import type { Note } from "@/domain/types";
import type { UpdateNoteInput } from "@/domain/note/factory";
import { format } from "date-fns";

export function NotesView() {
  const notes = useNotesStore((s) => s.notes);
  const hydrated = useNotesStore((s) => s.hydrated);
  const createNote = useNotesStore((s) => s.createNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const projects = useWorkspaceStore((s) => s.projects);
  const goals = useWorkspaceStore((s) => s.goals);
  const tasks = useTaskStore((s) => s.tasks);

  const [query, setQuery] = React.useState("");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const visible = searchNotes(
    notes.filter((note) => !note.archived),
    query
  );
  const selected = notes.find((note) => note.id === selectedId) ?? null;

  if (!hydrated) return <PageSkeleton />;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
      <div className="w-full max-w-xs border-r border-border-primary flex flex-col">
        <div className="px-4 pt-8 pb-3 lg:pt-10 space-y-3">
          <p className="label-caps">Notes</p>
          <Input
            placeholder="Search notes"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button
            size="sm"
            onClick={async () => {
              const note = await createNote({ content: "New note", title: "" });
              setSelectedId(note.id);
            }}
          >
            New note
          </Button>
        </div>
        <ul className="flex-1 overflow-y-auto px-2 pb-16">
          {visible.length === 0 && (
            <li className="px-2">
              <EmptyState title="Quiet for now." description="Notes are for context, not another workspace." />
            </li>
          )}
          {visible.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => setSelectedId(note.id)}
                className={`w-full text-left px-3 py-3 rounded min-h-11 ${selectedId === note.id ? "bg-bg-tertiary" : "hover:bg-bg-secondary"}`}
              >
                <div className="text-sm text-text-primary truncate">
                  {note.title || note.content.slice(0, 48) || "Untitled"}
                </div>
                <div className="text-[11px] text-text-tertiary font-mono mt-1">
                  {format(note.updatedAt, "d MMM")}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 min-w-0 px-5 py-8 lg:px-10 max-w-2xl">
        {!selected ? (
          <EmptyState title="Select a note." description="Keep these short. Link them to a task, project, or goal if they belong somewhere." />
        ) : (
          <NoteEditor
            key={selected.id}
            selected={selected}
            updateNote={updateNote}
            deleteNote={async (id) => {
              await deleteNote(id);
              setSelectedId(null);
            }}
            tasks={tasks}
            projects={projects}
            goals={goals}
          />
        )}
      </div>
    </div>
  );
}

function NoteEditor({
  selected,
  updateNote,
  deleteNote,
  tasks,
  projects,
  goals,
}: {
  selected: Note;
  updateNote: (id: string, updates: UpdateNoteInput) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<void>;
  tasks: { id: string; title: string; status: string }[];
  projects: { id: string; name: string; status: string }[];
  goals: { id: string; title: string; status: string }[];
}) {
  const [draftTitle, setDraftTitle] = React.useState(selected.title ?? "");
  const [draftContent, setDraftContent] = React.useState(selected.content);

  return (
    <div className="space-y-4">
      <Input
        value={draftTitle}
        onChange={(event) => setDraftTitle(event.target.value)}
        onBlur={() => void updateNote(selected.id, { title: draftTitle || null })}
        placeholder="Title"
      />
      <Textarea
        rows={16}
        value={draftContent}
        onChange={(event) => setDraftContent(event.target.value)}
        onBlur={() => {
          if (draftContent.trim()) void updateNote(selected.id, { content: draftContent });
        }}
        placeholder="Write the context"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <select
          className="h-11 rounded border border-border-secondary bg-bg-field px-2 text-sm text-text-primary"
          value={selected.taskId ?? ""}
          onChange={(event) => void updateNote(selected.id, { taskId: event.target.value || null })}
        >
          <option value="">No task</option>
          {tasks
            .filter((task) => task.status !== "archived")
            .slice(0, 80)
            .map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
        </select>
        <select
          className="h-11 rounded border border-border-secondary bg-bg-field px-2 text-sm text-text-primary"
          value={selected.projectId ?? ""}
          onChange={(event) =>
            void updateNote(selected.id, { projectId: event.target.value || null })
          }
        >
          <option value="">No project</option>
          {projects
            .filter((project) => project.status !== "archived")
            .map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
        </select>
        <select
          className="h-11 rounded border border-border-secondary bg-bg-field px-2 text-sm text-text-primary"
          value={selected.goalId ?? ""}
          onChange={(event) => void updateNote(selected.id, { goalId: event.target.value || null })}
        >
          <option value="">No goal</option>
          {goals
            .filter((goal) => goal.status !== "archived")
            .map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
        </select>
      </div>
      <Button variant="danger" size="sm" onClick={() => void deleteNote(selected.id)}>
        Delete
      </Button>
    </div>
  );
}
