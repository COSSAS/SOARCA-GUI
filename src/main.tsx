import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";

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
const router = createBrowserRouter([
  {
    path: "*",
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <ThemedApp>
          <GlobalStyles />
          <RouterProvider router={router} />
        </ThemedApp>
      </ThemeModeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
