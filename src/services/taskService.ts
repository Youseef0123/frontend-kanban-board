import { useTaskDataStore } from "@/store/taskDataStore";
import type { Task, CreateTaskPayload, ColumnId } from "@/types/task";

export interface FetchTasksParams {
  column: ColumnId;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TaskPage {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export async function fetchTasksByColumn(
  params: FetchTasksParams,
): Promise<TaskPage> {
  const { column, search = "", page = 1, limit = 5 } = params;
  const { tasks } = useTaskDataStore.getState();

  let filtered = tasks.filter((t) => t.column === column);

  if (search.trim()) {
    const lower = search.trim().toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(lower) ||
        t.description.toLowerCase().includes(lower),
    );
  }

  filtered = [...filtered].sort((a, b) => a.order - b.order);

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    tasks: paginated,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

export async function fetchTaskById(id: number): Promise<Task> {
  const { tasks } = useTaskDataStore.getState();
  const task = tasks.find((t) => t.id === id);
  if (!task) throw new Error(`Task ${id} not found`);
  return task;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { addTask } = useTaskDataStore.getState();
  return addTask(payload);
}

export async function updateTask(
  id: number,
  payload: Partial<Omit<Task, "id">>,
): Promise<Task> {
  const { updateTask: update } = useTaskDataStore.getState();
  const updated = update(id, payload);
  if (!updated) throw new Error(`Task ${id} not found`);
  return updated;
}

export async function deleteTask(id: number): Promise<void> {
  const { removeTask } = useTaskDataStore.getState();
  removeTask(id);
}
