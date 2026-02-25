import { readFileSync } from "fs";
import path from "path";
import type { Task } from "@/types/task";


let tasks: Task[] = [];
let initialized = false;

function initStore(): void {
  if (initialized) return;
  try {
    const dbPath = path.join(process.cwd(), "db.json");
    const data = JSON.parse(readFileSync(dbPath, "utf-8"));
    tasks = Array.isArray(data.tasks) ? data.tasks : [];
  } catch {
    tasks = [];
  }
  initialized = true;
}

export function getTasks(): Task[] {
  initStore();
  return tasks;
}

export function getTaskById(id: number): Task | undefined {
  initStore();
  return tasks.find((t) => t.id === id);
}

export function createTask(data: Omit<Task, "id">): Task {
  initStore();
  const maxId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) : 0;
  const newTask: Task = { ...data, id: maxId + 1 };
  tasks.push(newTask);
  return newTask;
}

export function updateTask(
  id: number,
  data: Partial<Omit<Task, "id">>,
): Task | null {
  initStore();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { ...tasks[idx], ...data };
  return tasks[idx];
}

export function removeTask(id: number): boolean {
  initStore();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
}
