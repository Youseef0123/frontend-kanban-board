import { useTasks } from "./useTasks";

export function useTaskStats(searchQuery: string) {
  const todo = useTasks({ column: "backlog", search: searchQuery });
  const inProgress = useTasks({ column: "in_progress", search: searchQuery });
  const review = useTasks({ column: "review", search: searchQuery });
  const done = useTasks({ column: "done", search: searchQuery });

  const counts = {
    backlog: todo.data?.pages[0]?.total ?? 0,
    in_progress: inProgress.data?.pages[0]?.total ?? 0,
    review: review.data?.pages[0]?.total ?? 0,
    done: done.data?.pages[0]?.total ?? 0,
  };

  const total =
    counts.backlog + counts.in_progress + counts.review + counts.done;

  return { counts, total };
}
