import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeModeCtx } from "./ThemeModeContext";

/** The three user-selectable modes */
export type ThemeMode = "auto" | "light" | "dark";
/** The resolved (effective) theme applied to the UI */
export type ResolvedTheme = "light" | "dark";

export interface ThemeModeContextValue {
  /** Current user-selected mode */
  mode: ThemeMode;
  /** Resolved theme after applying system preference (when mode === "auto") */
  resolved: ResolvedTheme;
  /** Update the user-selected mode */
  setMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = "soarca-theme-mode";

/**
 * Reads the system color-scheme preference via matchMedia.
 */
const getSystemPreference = (): ResolvedTheme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

/**
 * Reads the persisted theme mode from localStorage, defaulting to "auto".
 */
const getPersistedMode = (): ThemeMode => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "auto")
    return stored;
  return "auto";
};

/**
 * Provider that manages theme mode (auto/light/dark), detects the system
 * preference when set to "auto", and persists the choice to localStorage.
 */
export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<ThemeMode>(getPersistedMode);
  const [systemPref, setSystemPref] =
    useState<ResolvedTheme>(getSystemPreference);

  // Listen for OS-level theme changes
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) =>
      setSystemPref(e.matches ? "dark" : "light");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const resolved: ResolvedTheme = mode === "auto" ? systemPref : mode;

  const value = useMemo(
    () => ({ mode, resolved, setMode }),
    [mode, resolved, setMode],
  );

  return (
    <ThemeModeCtx.Provider value={value}>{children}</ThemeModeCtx.Provider>
  );
};
