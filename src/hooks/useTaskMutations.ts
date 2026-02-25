import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTask,
  updateTask,
  deleteTask,
} from '@/services/taskService';
import type { CreateTaskPayload, Task, ColumnId } from '@/types/task';
import { taskQueryKey } from './useTasks';
import { COLUMNS } from '@/types/task';


function useInvalidateAllColumns() {
  const queryClient = useQueryClient();
  return (search: string) => {
    COLUMNS.forEach(({ id }) => {
      queryClient.invalidateQueries({ queryKey: taskQueryKey(id, search) });
    });
  };
}

export function useCreateTask(currentSearch: string) {
  const invalidateAll = useInvalidateAllColumns();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => invalidateAll(currentSearch),
  });
}

export function useUpdateTask(currentSearch: string) {
  const invalidateAll = useInvalidateAllColumns();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Omit<Task, 'id'>> }) =>
      updateTask(id, payload),
    onSuccess: () => invalidateAll(currentSearch),
  });
}

export function useDeleteTask(currentSearch: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTask(id),

    onMutate: async (deletedId: number) => {
      const snapshots: Array<{ column: ColumnId; key: ReturnType<typeof taskQueryKey> }> = [];

      for (const col of COLUMNS) {
        const key = taskQueryKey(col.id, currentSearch);
        await queryClient.cancelQueries({ queryKey: key });

        const previous = queryClient.getQueryData(key);
        if (previous) snapshots.push({ column: col.id, key });

        queryClient.setQueriesData({ queryKey: key }, (old: unknown) => {
          if (!old || typeof old !== 'object') return old;
          const data = old as { pages: Array<{ tasks: Task[] }> };
          return {
            ...data,
            pages: data.pages.map((p) => ({
              ...p,
              tasks: p.tasks.filter((t) => t.id !== deletedId),
            })),
          };
        });
      }

      return { snapshots };
    },

    onError: (_err, _id, context) => {
      // Roll back optimistic removal on failure
      if (context?.snapshots) {
        context.snapshots.forEach(({ key }) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
    },

    onSettled: () => {
      COLUMNS.forEach(({ id }) => {
        queryClient.invalidateQueries({ queryKey: taskQueryKey(id, currentSearch) });
      });
    },
  });
}

// Moves a task to a new column + updates its order field.
// The optimistic update runs synchronously; the PATCH fires in the background.
export function useMoveTask(currentSearch: string) {
  const queryClient = useQueryClient();
  const invalidateAll = useInvalidateAllColumns();

  return useMutation({
    mutationFn: ({
      task,
      targetColumn,
      newOrder,
    }: {
      task: Task;
      targetColumn: ColumnId;
      newOrder: number;
    }) => updateTask(task.id, { column: targetColumn, order: newOrder }),

    onMutate: async ({ task, targetColumn, newOrder }) => {
      // Cancel in-flight refetches for source and destination columns
      const sourceKey = taskQueryKey(task.column, currentSearch);
      const destKey = taskQueryKey(targetColumn, currentSearch);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: sourceKey }),
        queryClient.cancelQueries({ queryKey: destKey }),
      ]);

      const prevSource = queryClient.getQueryData(sourceKey);
      const prevDest = queryClient.getQueryData(destKey);

      queryClient.setQueriesData({ queryKey: sourceKey }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const data = old as { pages: Array<{ tasks: Task[] }> };
        return {
          ...data,
          pages: data.pages.map((p) => ({
            ...p,
            tasks: p.tasks.filter((t) => t.id !== task.id),
          })),
        };
      });

      // Insert into dest column cache at the right position
      queryClient.setQueriesData({ queryKey: destKey }, (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        const data = old as { pages: Array<{ tasks: Task[] }> };
        const movedTask: Task = { ...task, column: targetColumn, order: newOrder };
        const pages = [...data.pages];
        if (pages.length > 0) {
          pages[0] = {
            ...pages[0],
            tasks: [...pages[0].tasks, movedTask].sort((a, b) => a.order - b.order),
          };
        }

        return { ...data, pages };
      });

      return { prevSource, prevDest, sourceKey, destKey };
    },

    onError: (_err, _vars, context) => {
      if (context) {
        if (context.prevSource) queryClient.setQueryData(context.sourceKey, context.prevSource);
        if (context.prevDest) queryClient.setQueryData(context.destKey, context.prevDest);
      }
    },

    onSettled: () => invalidateAll(currentSearch),
  });
}
