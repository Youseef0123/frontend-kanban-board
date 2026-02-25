import { create } from "zustand";
import type { Task, ColumnId } from "@/types/task";

type ModalConfig =
  | { type: "create"; column: ColumnId }
  | { type: "edit"; task: Task }
  | { type: "delete"; task: Task };

interface UIState {
  searchQuery: string;

  activeModal: ModalConfig | null;

  draggedTaskId: number | null;

  dragOverColumn: ColumnId | null;

  snackbar: { message: string } | null;
}

interface UIActions {
  setSearch: (query: string) => void;
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
  setDraggedTask: (id: number | null) => void;
  setDragOverColumn: (column: ColumnId | null) => void;
  showSnackbar: (message: string) => void;
  hideSnackbar: () => void;
}

export const useUIStore = create<UIState & UIActions>((set) => ({
  searchQuery: "",
  activeModal: null,
  draggedTaskId: null,
  dragOverColumn: null,
  snackbar: null,

  setSearch: (query) => set({ searchQuery: query }),

  openModal: (config) => set({ activeModal: config }),

  closeModal: () => set({ activeModal: null }),

  setDraggedTask: (id) => set({ draggedTaskId: id }),

  setDragOverColumn: (column) => set({ dragOverColumn: column }),

  showSnackbar: (message) => set({ snackbar: { message } }),

  hideSnackbar: () => set({ snackbar: null }),
}));
