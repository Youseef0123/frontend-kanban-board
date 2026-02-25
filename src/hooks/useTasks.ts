import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from '@tanstack/react-query';
import { fetchTasksByColumn, type TaskPage } from '@/services/taskService';
import type { ColumnId } from '@/types/task';



export function taskQueryKey(column: ColumnId, search: string): QueryKey {
  return ['tasks', column, search] as const;
}

interface UseTasksOptions {
  column: ColumnId;
  search: string;
}

export function useTasks({ column, search }: UseTasksOptions) {
  return useInfiniteQuery<
    TaskPage,
    Error,
    InfiniteData<TaskPage>,
    QueryKey,
    number
  >({
    queryKey: taskQueryKey(column, search),
    queryFn: ({ pageParam }) =>
      fetchTasksByColumn({ column, search, page: pageParam, limit: 5 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
}
