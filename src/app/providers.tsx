"use client";

import { useState, useContext, useMemo } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { makeQueryClient } from "@/lib/queryClient";
import { ThemeModeProvider, ThemeContext } from "@/store/themeStore";


let clientQueryClient: ReturnType<typeof makeQueryClient> | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!clientQueryClient) {
    clientQueryClient = makeQueryClient();
  }
  return clientQueryClient;
}

function ThemedApp({ children }: { children: React.ReactNode }) {
  const { mode } = useContext(ThemeContext);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                background: { default: "#f0f2f5", paper: "#ffffff" },
              }
            : {
                background: { default: "#0f1117", paper: "#1a1d27" },
                text: { primary: "#e8eaf6", secondary: "#8b92b8" },
                divider: "#2e3350",
              }),
        },
        typography: {
          fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
        },
        shape: { borderRadius: 8 },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                transition: "background-color 0.3s ease, color 0.3s ease",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: { boxShadow: "0 1px 4px rgba(0,0,0,0.07)" },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <ThemedApp>{children}</ThemedApp>
      </ThemeModeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
