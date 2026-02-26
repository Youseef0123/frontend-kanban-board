import { sql, ensureSchema } from "@/lib/db";
import type { Task } from "@/types/task";

type DbRow = {
  id: number;
  title: string;
  description: string;
  column: string;
  priority: string;
  order: number;
  created_at: Date | string;
};

function rowToTask(row: DbRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    column: row.column as Task["column"],
    priority: row.priority as Task["priority"],
    order: row.order,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at),
  };
}

export async function getTasks(): Promise<Task[]> {
  await ensureSchema();
  const rows = (await sql`SELECT id, title, description, "column", priority, "order", created_at FROM tasks ORDER BY "order" ASC`) as DbRow[];
  return rows.map(rowToTask);
}

export async function getTaskById(id: number): Promise<Task | null> {
  await ensureSchema();
  const rows = (await sql`SELECT id, title, description, "column", priority, "order", created_at FROM tasks WHERE id = ${id}`) as DbRow[];
  if (rows.length === 0) return null;
  return rowToTask(rows[0]);
}

export async function createTask(
  data: Omit<Task, "id" | "createdAt">,
): Promise<Task> {
  await ensureSchema();
  const rows = (await sql`
    INSERT INTO tasks (title, description, "column", priority, "order")
    VALUES (${data.title}, ${data.description}, ${data.column}, ${data.priority}, ${data.order})
    RETURNING id, title, description, "column", priority, "order", created_at
  `) as DbRow[];
  return rowToTask(rows[0]);
}

export async function updateTask(
  id: number,
  data: Partial<Omit<Task, "id" | "createdAt">>,
): Promise<Task | null> {
  const existing = await getTaskById(id);
  if (!existing) return null;

  const title = data.title ?? existing.title;
  const description = data.description ?? existing.description;
  const column = data.column ?? existing.column;
  const priority = data.priority ?? existing.priority;
  const order = data.order ?? existing.order;

  const rows = (await sql`
    UPDATE tasks
    SET title       = ${title},
        description = ${description},
        "column"    = ${column},
        priority    = ${priority},
        "order"     = ${order}
    WHERE id = ${id}
    RETURNING id, title, description, "column", priority, "order", created_at
  `) as DbRow[];

  if (rows.length === 0) return null;
  return rowToTask(rows[0]);
}

export async function removeTask(id: number): Promise<boolean> {
  await ensureSchema();
  const rows = (await sql`
    DELETE FROM tasks WHERE id = ${id} RETURNING id
  `) as { id: number }[];
  return rows.length > 0;
}
