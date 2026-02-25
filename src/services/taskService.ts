import axios from "axios";
import type { Task, CreateTaskPayload, ColumnId } from "@/types/task";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

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

  const queryParams: Record<string, string | number> = {
    column,
    _page: page,
    _limit: limit,
    _sort: "order",
    _order: "asc",
  };

  if (search.trim()) {
    queryParams["q"] = search.trim();
  }

  const response = await api.get<Task[]>("/tasks", { params: queryParams });
  const total = parseInt(response.headers["x-total-count"] ?? "0", 10);

  return {
    tasks: response.data,
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

export async function fetchTaskById(id: number): Promise<Task> {
  const response = await api.get<Task>(`/tasks/${id}`);
  return response.data;
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const response = await api.post<Task>("/tasks", {
    ...payload,
    createdAt: new Date().toISOString(),
  });
  return response.data;
}

export async function updateTask(
  id: number,
  payload: Partial<Omit<Task, "id">>,
): Promise<Task> {
  const response = await api.patch<Task>(`/tasks/${id}`, payload);
  return response.data;
}

export async function deleteTask(id: number): Promise<void> {
  await api.delete(`/tasks/${id}`);
}
