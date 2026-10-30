import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { shouldRetryApiRequest } from "@/api/utils";
import { AuthProvider } from "@/auth/AuthProvider";
import App from "./App";
import { ThemeModeProvider } from "./theme";
import { GlobalStyles } from "./theme/GlobalStyles";
import { ThemedApp } from "./theme/ThemedApp";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: shouldRetryApiRequest } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <ThemedApp>
          <BrowserRouter>
            <GlobalStyles />
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </ThemedApp>
      </ThemeModeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
