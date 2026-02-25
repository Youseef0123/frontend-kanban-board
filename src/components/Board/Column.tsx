"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import SvgIcon from "@mui/material/SvgIcon";
import AddIcon from "@mui/icons-material/Add";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTheme } from "@mui/material/styles";
import { useUIStore } from "@/store/uiStore";
import { useTasks } from "@/hooks/useTasks";
import TaskCard from "@/components/Task/TaskCard";
import ColumnHeader from "./ColumnHeader";
import type { Column as ColumnType, Task } from "@/types/task";

interface ColumnProps {
  column: ColumnType;
  draggedTaskId: number | null;
  isDropTarget: boolean;
}

// Top border colors per column give a strong visual anchor for each swimlane
const COLUMN_TOP_BORDER: Record<string, string> = {
  backlog: "#5c6bc0",
  in_progress: "#fb8c00",
  review: "#8e24aa",
  done: "#43a047",
};

export default function Column({
  column,
  draggedTaskId,
  isDropTarget,
}: ColumnProps) {
  const openModal = useUIStore((s) => s.openModal);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTasks({ column: column.id, search: searchQuery });

  const { setNodeRef } = useDroppable({ id: column.id });

  // Flatten paginated pages into a single task list
  const columnTasks: Task[] = data?.pages.flatMap((page) => page.tasks) ?? [];

  const totalCount = data?.pages[0]?.total ?? 0;

  const taskIds = columnTasks.map((t) => t.id);

  const topBorderColor = COLUMN_TOP_BORDER[column.id];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: { xs: "100%", sm: "auto" },
        minWidth: { xs: "auto", sm: 260, md: 280 },
        maxWidth: { xs: "100%", sm: 320 },
        flex: { xs: "0 0 auto", sm: "1 1 280px" },
        bgcolor: isDark
          ? isDropTarget
            ? "#1f2438"
            : "#1a1d27"
          : isDropTarget
            ? "#e3f2fd"
            : "#f8f9fa",
        borderRadius: 2,
        border: "2px solid",
        borderTop: `3px solid ${topBorderColor}`,
        borderColor: isDropTarget ? "primary.main" : "transparent",
        borderTopColor: topBorderColor,
        transition: "border-color 0.15s, background-color 0.3s ease",
        overflow: "hidden",
      }}
    >
      <ColumnHeader column={column} taskCount={totalCount} />

      {/* Scrollable card list */}
      <Box
        ref={setNodeRef}
        sx={{ flex: 1, overflowY: "auto", px: 1.5, pb: 1, minHeight: 80 }}
      >
        {isLoading && <LoadingSkeletons isDark={isDark} />}

        {isError && (
          <Alert severity="error" sx={{ m: 1, fontSize: 12 }}>
            Failed to load tasks
          </Alert>
        )}

        {!isLoading && !isError && columnTasks.length === 0 && (
          <EmptyState searchQuery={searchQuery} />
        )}

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {columnTasks.map((task) => (
            <Box key={task.id} mb={1}>
              <TaskCard task={task} isDragging={draggedTaskId === task.id} />
            </Box>
          ))}
        </SortableContext>

        {/* Load more*/}
        {hasNextPage && (
          <Button
            size="small"
            fullWidth
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            sx={{ my: 0.5, color: "text.secondary", fontSize: 12 }}
          >
            {isFetchingNextPage ? "Loading…" : "Load more"}
          </Button>
        )}
      </Box>

      {/* Add task Button*/}
      <Box px={1.5} pb={1.5}>
        <Button
          fullWidth
          startIcon={<AddIcon />}
          onClick={() => openModal({ type: "create", column: column.id })}
          sx={{
            border: "1.5px dashed",
            borderColor: "divider",
            color: "text.secondary",
            borderRadius: 1.5,
            py: 0.75,
            fontSize: 13,
            "&:hover": {
              borderColor: "text.secondary",
              bgcolor: "transparent",
            },
          }}
        >
          Add task
        </Button>
      </Box>
    </Box>
  );
}

function EmptyState({ searchQuery }: { searchQuery: string }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={4}
      gap={1}
    >
      <SvgIcon
        sx={{ fontSize: 40, color: "text.disabled", opacity: 0.45 }}
        viewBox="0 0 48 48"
      >
        <path
          fill="currentColor"
          d="M38 6H10C7.8 6 6 7.8 6 10v28c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V10c0-2.2-1.8-4-4-4zm-2 30H12V12h24v24zm-12-4h4v-8h4l-6-8-6 8h4v8z"
        />
      </SvgIcon>
      <Typography
        variant="caption"
        color="text.disabled"
        textAlign="center"
        sx={{ opacity: 0.7 }}
      >
        {searchQuery ? "No tasks found" : "No tasks here"}
      </Typography>
    </Box>
  );
}

function LoadingSkeletons({ isDark }: { isDark: boolean }) {
  return (
    <>
      {[1, 2].map((n) => (
        <Box
          key={n}
          mb={1}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: isDark ? "#2e3350" : "divider",
            p: "14px",
            bgcolor: isDark ? "#22263a" : "background.paper",
          }}
        >
          {/* Title line */}
          <Skeleton
            variant="text"
            width="70%"
            height={18}
            animation="wave"
            sx={{ mb: 0.75 }}
          />
          {/* Description lines */}
          <Skeleton variant="text" width="90%" height={14} animation="wave" />
          <Skeleton
            variant="text"
            width="60%"
            height={14}
            animation="wave"
            sx={{ mb: 1 }}
          />
          {/* Priority badge */}
          <Skeleton
            variant="rounded"
            width={52}
            height={20}
            animation="wave"
            sx={{ borderRadius: 10 }}
          />
        </Box>
      ))}
    </>
  );
}
