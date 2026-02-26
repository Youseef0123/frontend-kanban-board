import { NextRequest, NextResponse } from "next/server";
import { getTaskById, updateTask, removeTask } from "@/lib/taskStore";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id, 10);
  const task = await getTaskById(id);
  if (!task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const id = parseInt(params.id, 10);
  const body = await request.json();
  const updated = await updateTask(id, body);
  if (!updated) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const id = parseInt(params.id, 10);
  const ok = await removeTask(id);
  if (!ok) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
