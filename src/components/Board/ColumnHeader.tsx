"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import type { Column } from "@/types/task";

interface ColumnHeaderProps {
  column: Column;
  taskCount: number;
}

export default function ColumnHeader({ column, taskCount }: ColumnHeaderProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      px={2}
      py={1.5}
      sx={{ minHeight: 48 }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: column.color,
          flexShrink: 0,
        }}
      />

      <Typography
        variant="caption"
        fontWeight={700}
        letterSpacing="0.08em"
        sx={{ textTransform: "uppercase", flex: 1 }}
      >
        {column.label}
      </Typography>

      <Chip
        key={taskCount}
        label={taskCount}
        size="small"
        sx={{
          height: 20,
          bgcolor: isDark ? "#2a2d3e" : "#e8eaed",
          color: "text.secondary",
          fontWeight: 600,
          fontSize: 11,
          "& .MuiChip-label": { px: 1 },
          "@keyframes countPulse": {
            "0%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.3)" },
            "100%": { transform: "scale(1)" },
          },
          animation: "countPulse 0.3s ease-out",
        }}
      />
    </Box>
  );
}
