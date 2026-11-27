// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { AuthContext } from "@/auth/AuthContext";
import { ThemeModeProvider } from "@/theme";
import { ThemedApp } from "@/theme/ThemedApp";
import { MainPage } from "./MainPage";
import { SettingsPage } from "./SettingsPage";

vi.mock("./StatusIndicator", () => ({ StatusIndicator: () => null }));

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  storage.clear();
});

it("keeps the account menu and settings theme controls in sync", () => {
  const logout = vi.fn();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <ThemeModeProvider>
        <ThemedApp>
          <AuthContext.Provider
            value={{
              user: {
                subject: "user-1",
                provider: "test",
                permissions: [],
                anonymous: false,
                name: "Test User",
              },
              noAccess: false,
              isLoading: false,
              isError: false,
              can: () => false,
              logout,
              retry: vi.fn(),
            }}
          >
            <MemoryRouter initialEntries={["/settings"]}>
              <Routes>
                <Route path="/settings" element={<MainPage />}>
                  <Route index element={<SettingsPage />} />
                </Route>
              </Routes>
            </MemoryRouter>
          </AuthContext.Provider>
        </ThemedApp>
      </ThemeModeProvider>
    </QueryClientProvider>,
  );
  const menu = document.getElementById("account-menu");
  if (!menu) throw new Error("Account menu was not rendered");
  menu.style.display = "block";
  const menuThemes = within(menu).getByRole("radiogroup", { name: "Theme" });
  const settingsThemes = screen
    .getAllByRole("radiogroup", { name: "Theme" })
    .find((group) => group !== menuThemes);
  expect(settingsThemes).toBeTruthy();

  fireEvent.click(within(menuThemes).getByRole("radio", { name: "Dark" }));
  expect(
    (
      within(settingsThemes!).getByRole("radio", {
        name: "Dark",
      }) as HTMLInputElement
    ).checked,
  ).toBe(true);
  expect(storage.get("soarca-theme-mode")).toBe("dark");

  fireEvent.click(
    within(settingsThemes!).getByRole("radio", { name: "Light" }),
  );
  expect(
    (
      within(menuThemes).getByRole("radio", {
        name: "Light",
      }) as HTMLInputElement
    ).checked,
  ).toBe(true);
  const logoutButton = within(menu).getByRole("button", { name: "Log out" });
  fireEvent.click(logoutButton);
  expect(logout).toHaveBeenCalledOnce();
});
