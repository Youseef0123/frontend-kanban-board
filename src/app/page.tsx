"use client";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTheme } from "@mui/material/styles";
import SearchBar from "@/components/UI/SearchBar";
import KanbanBoard from "@/components/Board/KanbanBoard";
import { useThemeMode } from "@/store/themeStore";
import { useUIStore } from "@/store/uiStore";
import { useTaskStats } from "@/hooks/useTaskStats";

export default function HomePage() {
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const searchQuery = useUIStore((s) => s.searchQuery);

  const { counts, total } = useTaskStats(searchQuery);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Top nav*/}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: isDark ? "#13161f" : "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          color: "text.primary",
          transition: "background-color 0.3s ease",
        }}
      >
        {/*
          On xs: two rows — title row + search row.
          On sm+: single row with all items side by side.
        */}
        <Toolbar
          sx={{
            gap: { xs: 1, sm: 2 },
            flexWrap: { xs: "wrap", sm: "nowrap" },
            // Extra vertical padding when wrapped so rows don't feel cramped
            py: { xs: 0.75, sm: 0 },
            minHeight: { xs: "auto", sm: 64 },
          }}
        >
          {/* Title block — full width on xs so it takes its own row */}
          <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: "auto" } }}>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                fontFamily: "monospace",
                letterSpacing: "0.06em",
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              KANBAN BOARD
            </Typography>
            {/* Subtitle hidden on xs — saves vertical space */}
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Track your work from idea to done
            </Typography>
          </Box>

          {/* Live task stats — hidden below lg to avoid crowding */}
          <Box
            sx={{
              display: { xs: "none", lg: "flex" },
              alignItems: "center",
              mr: 1,
              flexShrink: 0,
            }}
          >
            <Typography variant="caption" color="text.secondary" noWrap>
              {total} total · {counts.backlog} to do · {counts.in_progress} in
              progress · {counts.review} in review · {counts.done} done
            </Typography>
          </Box>

          {/* Search + toggle sit together on xs second row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: { xs: "100%", sm: "auto" },
              flex: { xs: "0 0 100%", sm: "none" },
            }}
          >
            <SearchBar />

            {/* Dark / light toggle — persisted to localStorage on each click */}
            <IconButton
              onClick={toggleMode}
              size="small"
              aria-label={
                mode === "dark" ? "switch to light mode" : "switch to dark mode"
              }
              sx={{ color: "text.secondary", flexShrink: 0 }}
            >
              {mode === "dark" ? (
                <LightModeIcon fontSize="small" />
              ) : (
                <DarkModeIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Board area */}
      <Container maxWidth={false} sx={{ pt: 3, px: { xs: 2, md: 3 } }}>
        <KanbanBoard />
      </Container>
    </Box>
  );
}
