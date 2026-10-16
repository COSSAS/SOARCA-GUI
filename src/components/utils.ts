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
  Accent = "accent",
  Primary = "primary",
}

/**
 * Size options for components: buttons, form controls, icons and spinners.
 * Controls map to theme.control_height, icons and spinners to theme.icon_size.
 */
export const enum ThemeSize {
  Small = "sm",
  Medium = "md",
  Large = "lg",
}

const ICON_PIXEL_SIZE_BY_THEME_SIZE: Record<ThemeSize, number> = {
  [ThemeSize.Small]: theme.icon_size.sm,
  [ThemeSize.Medium]: theme.icon_size.md,
  [ThemeSize.Large]: theme.icon_size.lg,
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
    [ThemeVariant.Primary]: "info",
    [ThemeVariant.Accent]: "accent",
  };
  return themeObj.colors[variantMap[variant]] as VariantColors;
};

/**
 * Maps ThemeSize to an icon size in pixels (Icon and Spinner): sm 12, md 16, lg 20.
 * @param size - The ThemeSize to map.
 * @returns The icon size in pixels. Medium (16px) matches the body text.
 * @example
 * const px = getIconPixelSize(ThemeSize.Large); // 20
 */
export const getIconPixelSize = (size: ThemeSize) => {
  return ICON_PIXEL_SIZE_BY_THEME_SIZE[size] ?? theme.icon_size.md;
};

/**
 * Dimensions shared by buttons, inputs and selects, so that controls of the
 * same size have the same height: sm 28px, md 34px, lg 42px.
 * @returns height, horizontal padding, gap between icon and label, and font size.
 * @example
 * const { height, paddingX } = getControlSize(theme, ThemeSize.Small);
 */
export const getControlSize = (themeObj: Theme, size: ThemeSize) => {
  switch (size) {
    case ThemeSize.Small:
      return {
        height: themeObj.control_height.sm,
        paddingX: themeObj.spacing.sm,
        gap: themeObj.spacing.xs,
        fontSize: themeObj.fonts.size.sm,
      };
    case ThemeSize.Large:
      return {
        height: themeObj.control_height.lg,
        paddingX: themeObj.spacing.md,
        gap: themeObj.spacing.sm,
        fontSize: themeObj.fonts.size.base,
      };
    default:
      return {
        height: themeObj.control_height.md,
        paddingX: themeObj.spacing.sm,
        gap: themeObj.spacing.sm,
        fontSize: themeObj.fonts.size.base,
      };
  }
};
