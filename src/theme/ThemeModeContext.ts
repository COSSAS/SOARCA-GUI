import { createContext, useContext } from "react";
import type { ThemeModeContextValue } from "./ThemeModeProvider";

/** Context and hook for managing theme mode (auto/light/dark) and system preference. */
export const ThemeModeCtx = createContext<ThemeModeContextValue | undefined>(
  undefined,
);

/**
 * Hook to access the current theme mode, resolved theme, and setter.
 */
export const useThemeMode = (): ThemeModeContextValue => {
  const ctx = useContext(ThemeModeCtx);
  if (!ctx)
    throw new Error("useThemeMode must be used within a ThemeModeProvider");
  return ctx;
};
