// Whenever you export both components and other things TypeScript complaints that fast-reload
// cannot handle mixed exports. For this reason, we export them here.

import { theme, Theme } from "@/theme/theme";
import { createContext, useContext } from "react";

// ENUMS & CONSTANTS

/**
 * This enum defines the theme variants used for styling components.
 * You can see the variants defined in the theme file under colors.
 */
export const enum ThemeVariant {
  Success = "success",
  Warning = "warning",
  Error = "error",
  Info = "info",
  Accent = "accent",
  Primary = "primary",
  Secondary = "secondary",
}

/**
 * This enum defines the size options available for theming components.
 * The sizes map to rem values defined in the theme size settings.
 */
export const enum ThemeSize {
  ExtraSmall = "xs",
  Small = "sm",
  Medium = "md",
  Large = "lg",
  ExtraLarge = "xl",
  TwoXL = "2xl",
  ThreeXL = "3xl",
  FourXL = "4xl",
}

const THEME_SIZE_VALUES_BY_THEME_SIZE: Record<ThemeSize, string> = {
  [ThemeSize.ExtraSmall]: theme.size.xs,
  [ThemeSize.Small]: theme.size.sm,
  [ThemeSize.Medium]: theme.size.md,
  [ThemeSize.Large]: theme.size.lg,
  [ThemeSize.ExtraLarge]: theme.size.xl,
  [ThemeSize.TwoXL]: theme.size["2xl"],
  [ThemeSize.ThreeXL]: theme.size["3xl"],
  [ThemeSize.FourXL]: theme.size["4xl"],
};

const THEME_PIXEL_SIZE_VALUES_BY_THEME_SIZE: Record<ThemeSize, number> = {
  [ThemeSize.ExtraSmall]: theme.size_pixels.xs,
  [ThemeSize.Small]: theme.size_pixels.sm,
  [ThemeSize.Medium]: theme.size_pixels.md,
  [ThemeSize.Large]: theme.size_pixels.lg,
  [ThemeSize.ExtraLarge]: theme.size_pixels.xl,
  [ThemeSize.TwoXL]: theme.size_pixels["2xl"],
  [ThemeSize.ThreeXL]: theme.size_pixels["3xl"],
  [ThemeSize.FourXL]: theme.size_pixels["4xl"],
};

export const enum BadgeShape {
  Pill = "pill",
  Rounded = "rounded",
}

export const enum ButtonWidth {
  Full = "full",
  Auto = "auto",
}

export const TabsContext = createContext<TabsContextType | undefined>(
  undefined,
);

// INTERFACES & TYPES

export interface TabsContextType {
  activeTab: string;
  selectTab: (tabId: string) => void;
  isActive: (tabId: string) => boolean;
}

// HOOKS

/**
 * Hook for accessing and controlling tab state from within a TabsProvider.
 * @returns Object with current tab id, function to select a tab, and utility to check if a tab is active.
 * @throws Error if used outside of TabsProvider.
 * @example
 * const { activeTab, selectTab, isActive } = useTabs();
 * selectTab("detailed");
 */
export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used within a TabsProvider");
  }
  return context;
};

// TYPES

export type VariantColors = {
  bg: string;
  border: string;
  text: string;
  solidBg: string;
  solidText: string;
};

// FUNCTIONS

/**
 * Maps a theme variant to the corresponding color set from a theme object.
 * This function reads colors from the provided theme parameter, allowing it to work
 * with both light and dark themes dynamically.
 * @param themeObj - The theme object containing color definitions (light or dark theme)
 * @param variant - The ThemeVariant to map
 * @returns The corresponding theme colors for the given variant
 * @example
 * // In a styled-component (theme comes from context)
 * const colors = getVariantColors(theme, ThemeVariant.Success);
 */
export const getVariantColors = (
  themeObj: Theme,
  variant: ThemeVariant,
): VariantColors => {
  const variantMap: Record<ThemeVariant, keyof typeof themeObj.colors> = {
    [ThemeVariant.Success]: "success",
    [ThemeVariant.Warning]: "warning",
    [ThemeVariant.Error]: "error",
    [ThemeVariant.Info]: "info",
    [ThemeVariant.Primary]: "info",
    [ThemeVariant.Accent]: "accent",
    [ThemeVariant.Secondary]: "accent",
  };
  return themeObj.colors[variantMap[variant]] as VariantColors;
};

/**
 * Maps ThemeSize enum to actual size values from the theme.
 * @param size - The ThemeSize to map.
 * @returns The corresponding size value from the theme.
 * @example
 * const sizeValue = getThemeSizeValuesByThemeSize(ThemeSize.Large);
 */
export const getThemeSizeValuesByThemeSize = (size: ThemeSize) => {
  return THEME_SIZE_VALUES_BY_THEME_SIZE[size] ?? theme.size.md;
};

/**
 * Unfortunately, sometimes we need pixel values instead of rem values. This is to perform some calculations.
 * when for example we want the container of an icon to be as big as the icon itself plus some percentage that
 * scales with the icon size.
 * This utility function maps ThemeSize to pixel values from the theme, so that, at least, we have a single source of truth for sizes.
 * @param size - The ThemeSize to map.
 * @returns The corresponding pixel size value from the theme.
 * @example
 * const pixelSizeValue = getThemePixelSizeValuesByThemeSize(ThemeSize.Large); // returns "16px"
 */
export const getThemePixelSizeValuesByThemeSize = (size: ThemeSize) => {
  return THEME_PIXEL_SIZE_VALUES_BY_THEME_SIZE[size] ?? theme.size_pixels.md;
};
