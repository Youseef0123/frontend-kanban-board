"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PriorityBadge from "@/components/UI/PriorityBadge";
import TaskMenu from "./TaskMenu";
import type { Task, Priority } from "@/types/task";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

const PRIORITY_BORDER: Record<Priority, string> = {
  high: "#c0392b",
  medium: "#d4820a",
  low: "#3a7d44",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export default function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.4 : 1,
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: isDark ? "#2e3350" : "divider",
          bgcolor: isDark ? "#22263a" : "background.paper",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          position: "relative",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
          "@keyframes slideUp": {
            from: { opacity: 0, transform: "translateY(8px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
          animation: "slideUp 0.18s ease-out",
          "&:hover": {
            boxShadow: isDark
              ? "0 4px 12px rgba(0,0,0,0.4)"
              : "0 4px 12px rgba(0,0,0,0.10)",
            "& .task-menu-btn": { opacity: 1 },
          },
        }}
      >
        <CardContent sx={{ p: "14px !important" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={0.75}
          >
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ fontFamily: "monospace", lineHeight: 1.4, flex: 1, pr: 1 }}
            >
              {task.title}
            </Typography>
            <Box
              className="task-menu-btn"
              sx={{ opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}
              onPointerDown={(e) => {
                e.stopPropagation();
              }}
            >
              <TaskMenu
                task={task}
                anchorEl={menuAnchor}
                onOpen={(el) => setMenuAnchor(el)}
                onClose={() => setMenuAnchor(null)}
              />
            </Box>
          </Box>

          {task.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={1.25}
              sx={{ lineHeight: 1.5 }}
            >
              {task.description}
            </Typography>
          )}

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={0.5}
          >
            <PriorityBadge priority={task.priority} />
            {task.createdAt && (
              <Typography
                variant="caption"
                sx={{ fontSize: 10, color: "text.secondary", opacity: 0.7 }}
              >
                {formatDate(task.createdAt)}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
