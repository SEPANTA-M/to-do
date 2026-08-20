import { create } from "zustand";
import type { TimeGranularity } from "@/domain/task/geometry";
import type { Task } from "@/domain/types";

export interface ComposerDefaults {
  title?: string;
  date?: Date;
  startTime?: Date;
  estimatedDuration?: number;
  prompt?: string;
  projectId?: string;
  goalId?: string;
  parentTaskId?: string;
}

export interface PendingConflict {
  taskId: string;
  proposed: Task;
  conflicts: Task[];
  kind: "move" | "resize" | "create";
}

interface UiState {
  composerOpen: boolean;
  composerDefaults: ComposerDefaults | null;
  inspectorTaskId: string | null;
  inspectorCollapsed: boolean;
  selectedIds: string[];
  granularity: TimeGranularity;
  pendingConflict: PendingConflict | null;
  contextMenu: { taskId: string; x: number; y: number } | null;
  sidebarCollapsed: boolean;

  openComposer: (defaults?: ComposerDefaults) => void;
  closeComposer: () => void;
  openInspector: (taskId: string) => void;
  closeInspector: () => void;
  toggleInspectorCollapsed: () => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelected: (id: string, multi: boolean) => void;
  setGranularity: (granularity: TimeGranularity) => void;
  setPendingConflict: (conflict: PendingConflict | null) => void;
  setContextMenu: (menu: { taskId: string; x: number; y: number } | null) => void;
  toggleSidebarCollapsed: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  composerOpen: false,
  composerDefaults: null,
  inspectorTaskId: null,
  inspectorCollapsed: false,
  selectedIds: [],
  granularity: 15,
  pendingConflict: null,
  contextMenu: null,
  sidebarCollapsed: false,

  openComposer: (defaults) =>
    set({ composerOpen: true, composerDefaults: defaults ?? null }),
  closeComposer: () => set({ composerOpen: false, composerDefaults: null }),
  openInspector: (taskId) =>
    set({ inspectorTaskId: taskId, inspectorCollapsed: false }),
  closeInspector: () => set({ inspectorTaskId: null }),
  toggleInspectorCollapsed: () =>
    set((state) => ({ inspectorCollapsed: !state.inspectorCollapsed })),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelected: (id, multi) =>
    set((state) => {
      if (!multi) return { selectedIds: [id] };
      const exists = state.selectedIds.includes(id);
      return {
        selectedIds: exists
          ? state.selectedIds.filter((item) => item !== id)
          : [...state.selectedIds, id],
      };
    }),
  setGranularity: (granularity) => set({ granularity }),
  setPendingConflict: (pendingConflict) => set({ pendingConflict }),
  setContextMenu: (contextMenu) => set({ contextMenu }),
  toggleSidebarCollapsed: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
