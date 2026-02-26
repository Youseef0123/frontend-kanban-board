import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task } from "@/types/task";

const SEED_TASKS: Task[] = [
  {
    id: 1,
    title: "API integration",
    description:
      "Integrate third-party payment gateway API with error handling and retry logic.",
    column: "backlog",
    priority: "high",
    order: 12,
    createdAt: "2024-01-10T09:00:00.000Z",
  },
  {
    id: 2,
    title: "Unit tests",
    description: "Write unit tests for auth middleware and user service layer.",
    column: "in_progress",
    priority: "low",
    order: 19,
    createdAt: "2024-01-11T10:30:00.000Z",
  },
  {
    id: 3,
    title: "Performance audit",
    description:
      "Run Lighthouse audit, fix LCP issues, lazy-load below-the-fold images.",
    column: "in_progress",
    priority: "low",
    order: 17,
    createdAt: "2024-01-12T11:00:00.000Z",
  },
  {
    id: 4,
    title: "Notification system",
    description:
      "Build in-app notification center with real-time updates via WebSocket.",
    column: "done",
    priority: "medium",
    order: 5,
    createdAt: "2024-01-13T14:00:00.000Z",
  },
  {
    id: 5,
    title: "User settings page",
    description:
      "Profile settings, password change, notification preferences, and avatar upload.",
    column: "in_progress",
    priority: "low",
    order: 20,
    createdAt: "2024-01-14T08:30:00.000Z",
  },
  {
    id: 6,
    title: "Authentication flow",
    description:
      "Implement JWT refresh token rotation, OAuth2 with Google, and session persistence.",
    column: "done",
    priority: "high",
    order: 4,
    createdAt: "2024-01-08T09:00:00.000Z",
  },
  {
    id: 7,
    title: "File upload component",
    description:
      "Drag-and-drop file upload with preview, progress bar, and S3 presigned URL support.",
    column: "backlog",
    priority: "medium",
    order: 9,
    createdAt: "2024-01-09T11:00:00.000Z",
  },
  {
    id: 8,
    title: "Dark mode support",
    description:
      "Implement system-preference-aware dark mode using CSS custom properties and MUI theme.",
    column: "done",
    priority: "medium",
    order: 3,
    createdAt: "2024-01-06T10:00:00.000Z",
  },
  {
    id: 9,
    title: "Dashboard layout",
    description:
      "Responsive dashboard with resizable widget panels and persistent layout via localStorage.",
    column: "review",
    priority: "medium",
    order: 16,
    createdAt: "2024-01-07T13:00:00.000Z",
  },
  {
    id: 10,
    title: "Design system tokens",
    description:
      "Define color, spacing, and typography tokens. Publish as a shared npm package.",
    column: "review",
    priority: "high",
    order: 18,
    createdAt: "2024-01-01T09:00:00.000Z",
  },
];

interface TaskDataState {
  tasks: Task[];
  nextId: number;
  addTask: (task: Omit<Task, "id" | "createdAt">) => Task;
  updateTask: (
    id: number,
    data: Partial<Omit<Task, "id" | "createdAt">>,
  ) => Task | null;
  removeTask: (id: number) => boolean;
}

export const useTaskDataStore = create<TaskDataState>()(
  persist(
    (set, get) => ({
      tasks: SEED_TASKS,
      nextId: SEED_TASKS.length + 1,

      addTask: (data) => {
        const { tasks, nextId } = get();
        const newTask: Task = {
          ...data,
          id: nextId,
          createdAt: new Date().toISOString(),
        };
        set({ tasks: [...tasks, newTask], nextId: nextId + 1 });
        return newTask;
      },

      updateTask: (id, data) => {
        const { tasks } = get();
        const idx = tasks.findIndex((t) => t.id === id);
        if (idx === -1) return null;
        const updated: Task = { ...tasks[idx], ...data };
        const newTasks = [...tasks];
        newTasks[idx] = updated;
        set({ tasks: newTasks });
        return updated;
      },

      removeTask: (id) => {
        const { tasks } = get();
        const exists = tasks.some((t) => t.id === id);
        if (!exists) return false;
        set({ tasks: tasks.filter((t) => t.id !== id) });
        return true;
      },
    }),
    {
      name: "kanban-tasks", // localStorage key
    },
  ),
);
