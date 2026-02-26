import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/taskStore";
import type { Task } from "@/types/task";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const column = searchParams.get("column");
  const page = parseInt(searchParams.get("_page") ?? "1", 10);
  const limit = parseInt(searchParams.get("_limit") ?? "10", 10);
  const sort = searchParams.get("_sort");
  const order = searchParams.get("_order") ?? "asc";
  const q = searchParams.get("q");

  let filtered: Task[] = await getTasks();

  if (column) {
    filtered = filtered.filter((t) => t.column === column);
  }

  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title?.toLowerCase().includes(lower) ||
        t.description?.toLowerCase().includes(lower),
    );
  }

  if (sort) {
    filtered = [...filtered].sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sort];
      const bv = (b as unknown as Record<string, unknown>)[sort];
      if (av === bv) return 0;
      const cmp = av! > bv! ? 1 : -1;
      return order === "asc" ? cmp : -cmp;
    });
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return NextResponse.json(paginated, {
    headers: {
      "x-total-count": String(total),
      "Access-Control-Expose-Headers": "x-total-count",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const newTask = await createTask(body);
  return NextResponse.json(newTask, { status: 201 });
}
