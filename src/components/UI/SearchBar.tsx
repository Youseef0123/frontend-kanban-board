"use client";

import { useCallback, useEffect, useRef } from "react";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import SearchIcon from "@mui/icons-material/Search";
import { useUIStore } from "@/store/uiStore";

// Debounce lives here rather than in the store so the store always holds
const DEBOUNCE_MS = 300;

export default function SearchBar() {
  const setSearch = useUIStore((s) => s.setSearch);
  const currentQuery = useUIStore((s) => s.searchQuery);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ctrl+K is a common pattern in dev tools, feels natural for task search
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => setSearch(value), DEBOUNCE_MS);
    },
    [setSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        alignItems: "center",
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        width: { xs: "auto", sm: 210, md: 260 },
        flex: { xs: 1, sm: "none" },
        bgcolor: "background.paper",
        transition: "background-color 0.3s ease",
      }}
    >
      <SearchIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />
      <InputBase
        inputRef={inputRef}
        placeholder={
          typeof window !== "undefined" && window.innerWidth < 600
            ? "Search tasks…"
            : "Search tasks… (Ctrl+K)"
        }
        defaultValue={currentQuery}
        onChange={handleChange}
        inputProps={{ "aria-label": "search tasks" }}
        sx={{ flex: 1, fontSize: 14 }}
      />
    </Paper>
  );
}
