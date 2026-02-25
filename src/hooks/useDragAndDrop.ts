import { useCallback } from 'react';
import {
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useUIStore } from '@/store/uiStore';
import { useMoveTask } from './useTaskMutations';
import type { Task, ColumnId } from '@/types/task';
import { COLUMNS } from '@/types/task';

// Centralises all dnd-kit event handlers so KanbanBoard stays focused
// on layout concerns and doesn't accumulate drag state logic.
export function useDragAndDrop({
  allTasks,
  searchQuery,
}: {
  allTasks: Record<ColumnId, Task[]>;
  searchQuery: string;
}) {
  const setDraggedTask = useUIStore((s) => s.setDraggedTask);
  const setDragOverColumn = useUIStore((s) => s.setDragOverColumn);
  const moveTask = useMoveTask(searchQuery);

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      setDraggedTask(Number(active.id));
    },
    [setDraggedTask]
  );

  const handleDragOver = useCallback(
    ({ over }: DragOverEvent) => {
      if (!over) {
        setDragOverColumn(null);
        return;
      }

      // The droppable id is either a column id or a task id.
      // Resolve to a column id in both cases.
      const overId = String(over.id) as ColumnId;
      const isColumn = COLUMNS.some((c) => c.id === overId);

      if (isColumn) {
        setDragOverColumn(overId);
      } else {
        // Find which column contains the task being hovered over
        const ownerColumn = Object.entries(allTasks).find(([, tasks]) =>
          tasks.some((t) => String(t.id) === overId)
        );
        setDragOverColumn(ownerColumn ? (ownerColumn[0] as ColumnId) : null);
      }
    },
    [allTasks, setDragOverColumn]
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setDraggedTask(null);
      setDragOverColumn(null);

      if (!over) return;

      const draggedId = Number(active.id);
      const overId = String(over.id);

      // Find the task that was dragged
      let draggedTask: Task | undefined;
      for (const colTasks of Object.values(allTasks)) {
        draggedTask = colTasks.find((t) => t.id === draggedId);
        if (draggedTask) break;
      }

      if (!draggedTask) return;

      // Determine target column (droppable could be a column or task card)
      const isColumn = COLUMNS.some((c) => c.id === overId);
      let targetColumn: ColumnId;

      if (isColumn) {
        targetColumn = overId as ColumnId;
      } else {
        const ownerEntry = Object.entries(allTasks).find(([, tasks]) =>
          tasks.some((t) => String(t.id) === overId)
        );
        if (!ownerEntry) return;
        targetColumn = ownerEntry[0] as ColumnId;
      }

      // No-op if dropped back into the same column at same position
      if (draggedTask.column === targetColumn) return;

      // Place at end of target column — simple ordering that keeps it predictable
      const targetColumnTasks = allTasks[targetColumn] ?? [];
      const newOrder =
        targetColumnTasks.length > 0
          ? Math.max(...targetColumnTasks.map((t) => t.order)) + 1
          : 1;

      moveTask.mutate({ task: draggedTask, targetColumn, newOrder });
    },
    [allTasks, moveTask, setDraggedTask, setDragOverColumn]
  );

  const handleDragCancel = useCallback(() => {
    setDraggedTask(null);
    setDragOverColumn(null);
  }, [setDraggedTask, setDragOverColumn]);

  return { handleDragStart, handleDragOver, handleDragEnd, handleDragCancel };
}
