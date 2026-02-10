import React from "react";
import { ThemeProvider } from "styled-components";

import { darkTheme, theme, useThemeMode } from ".";

/**
 * Hooks into the theme context to determine the active theme and provides it to the app via ThemeProvider.
 */
export const ThemedApp: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { resolved } = useThemeMode();
  const activeTheme = resolved === "dark" ? darkTheme : theme;

  return <ThemeProvider theme={activeTheme}>{children}</ThemeProvider>;
};
