"use client";

import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { Priority } from "@/types/task";

interface PriorityBadgeProps {
  priority: Priority;
}

const LIGHT_STYLES: Record<
  Priority,
  { label: string; bgcolor: string; color: string }
> = {
  high: { label: "HIGH", bgcolor: "#fdecea", color: "#d32f2f" },
  medium: { label: "MEDIUM", bgcolor: "#fff8e1", color: "#f57c00" },
  low: { label: "LOW", bgcolor: "#e8f5e9", color: "#2e7d32" },
};

// Darker backgrounds 
const DARK_STYLES: Record<
  Priority,
  { label: string; bgcolor: string; color: string }
> = {
  high: { label: "HIGH", bgcolor: "#3d1a1a", color: "#ef9a9a" },
  medium: { label: "MEDIUM", bgcolor: "#3d2e00", color: "#ffcc80" },
  low: { label: "LOW", bgcolor: "#1a2e1a", color: "#a5d6a7" },
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const theme = useTheme();
  const styles = theme.palette.mode === "dark" ? DARK_STYLES : LIGHT_STYLES;
  const { label, bgcolor, color } = styles[priority];

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor,
        color,
        fontWeight: 600,
        fontSize: 10,
        letterSpacing: "0.04em",
        height: 20,
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}
