"use client";

import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { useUIStore } from "@/store/uiStore";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { taskQueryKey } from "@/hooks/useTasks";
import Column from "./Column";
import TaskCard from "@/components/Task/TaskCard";
import TaskForm from "@/components/Task/TaskForm";
import ConfirmDialog from "@/components/UI/ConfirmDialog";
import { useDeleteTask } from "@/hooks/useTaskMutations";
import { COLUMNS } from "@/types/task";
import type { Task, ColumnId } from "@/types/task";
import type { InfiniteData } from "@tanstack/react-query";
import type { TaskPage } from "@/services/taskService";

export default function KanbanBoard() {
  const draggedTaskId = useUIStore((s) => s.draggedTaskId);
  const dragOverColumn = useUIStore((s) => s.dragOverColumn);
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const snackbar = useUIStore((s) => s.snackbar);
  const showSnackbar = useUIStore((s) => s.showSnackbar);
  const hideSnackbar = useUIStore((s) => s.hideSnackbar);
  const queryClient = useQueryClient();

  const deleteTask = useDeleteTask(searchQuery);

  // Collect all currently cached tasks so useDragAndDrop can reason about
  // column membership without firing extra network requests.
  const allTasks: Record<ColumnId, Task[]> = {} as Record<ColumnId, Task[]>;
  for (const col of COLUMNS) {
    const cacheData = queryClient.getQueryData<InfiniteData<TaskPage>>(
      taskQueryKey(col.id, searchQuery),
    );
    allTasks[col.id] = cacheData?.pages.flatMap((p) => p.tasks) ?? [];
  }

  const { handleDragStart, handleDragOver, handleDragEnd, handleDragCancel } =
    useDragAndDrop({ allTasks, searchQuery });

  // PointerSensor with an activation distance prevents accidental drags
  // when the user just wants to click the three-dot menu.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  // Find the task being dragged for the overlay ghost card
  let draggedTask: Task | undefined;
  if (draggedTaskId !== null) {
    for (const colTasks of Object.values(allTasks)) {
      draggedTask = colTasks.find((t) => t.id === draggedTaskId);
      if (draggedTask) break;
    }
  }

  const isDeleteModalOpen = activeModal?.type === "delete";
  const taskToDelete = isDeleteModalOpen ? activeModal.task : undefined;

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask.mutateAsync(taskToDelete.id);
      showSnackbar("Task deleted");
      closeModal();
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: "flex-start",
            overflowX: { xs: "visible", sm: "auto" },
            pb: 2,
            minHeight: { xs: "auto", sm: "calc(100vh - 120px)" },
            WebkitOverflowScrolling: "touch",
          }}
        >
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              draggedTaskId={draggedTaskId}
              isDropTarget={dragOverColumn === column.id}
            />
          ))}
        </Box>

        <DragOverlay>
          {draggedTask ? (
            <Box
              sx={{
                opacity: 0.85,
                transform: "rotate(2deg)",
                pointerEvents: "none",
              }}
            >
              <TaskCard task={draggedTask} isDragging />
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Global modals */}
      <TaskForm />

      <ConfirmDialog
        open={isDeleteModalOpen}
        title="Delete task?"
        description={`"${taskToDelete?.title ?? ""}" will be permanently removed.`}
        loading={deleteTask.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={closeModal}
      />

      {/* Global toast notifications  */}
      <Snackbar
        open={snackbar !== null}
        autoHideDuration={3000}
        onClose={hideSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={hideSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </>
  );
}
