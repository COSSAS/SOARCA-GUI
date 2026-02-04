import { theme } from "@/theme/theme";
import { describe, expect, test } from "vitest";
import {
  getThemeColorsByVariant,
  getThemePixelSizeValuesByThemeSize,
  getThemeSizeValuesByThemeSize,
  ThemeSize,
  ThemeVariant,
} from "./utils";

describe("Component utility functions", () => {
  test("getThemeColorsByVariant returns correct colors for all variants", () => {
    expect(getThemeColorsByVariant(ThemeVariant.Success)).toBe(
      theme.colors.success,
    );
    expect(getThemeColorsByVariant(ThemeVariant.Warning)).toBe(
      theme.colors.warning,
    );
    expect(getThemeColorsByVariant(ThemeVariant.Error)).toBe(
      theme.colors.error,
    );
    expect(getThemeColorsByVariant(ThemeVariant.Info)).toBe(theme.colors.info);
    expect(getThemeColorsByVariant(ThemeVariant.Primary)).toBe(
      theme.colors.info,
    );
    expect(getThemeColorsByVariant(ThemeVariant.Accent)).toBe(
      theme.colors.accent,
    );
    expect(getThemeColorsByVariant(ThemeVariant.Secondary)).toBe(
      theme.colors.accent,
    );
  });

  test("getThemeColorsByVariant returns info color as fallback for invalid variant", () => {
    const invalidVariant = "invalid" as ThemeVariant;
    expect(getThemeColorsByVariant(invalidVariant)).toBe(theme.colors.info);
  });

  test("getThemeSizeValuesByThemeSize returns correct size values for all sizes", () => {
    expect(getThemeSizeValuesByThemeSize(ThemeSize.ExtraSmall)).toBe(
      theme.size.xs,
    );
    expect(getThemeSizeValuesByThemeSize(ThemeSize.Small)).toBe(theme.size.sm);
    expect(getThemeSizeValuesByThemeSize(ThemeSize.Medium)).toBe(theme.size.md);
    expect(getThemeSizeValuesByThemeSize(ThemeSize.Large)).toBe(theme.size.lg);
    expect(getThemeSizeValuesByThemeSize(ThemeSize.ExtraLarge)).toBe(
      theme.size.xl,
    );
    expect(getThemeSizeValuesByThemeSize(ThemeSize.TwoXL)).toBe(
      theme.size["2xl"],
    );
    expect(getThemeSizeValuesByThemeSize(ThemeSize.ThreeXL)).toBe(
      theme.size["3xl"],
    );
    expect(getThemeSizeValuesByThemeSize(ThemeSize.FourXL)).toBe(
      theme.size["4xl"],
    );
  });

  test("getThemeSizeValuesByThemeSize returns md as fallback for invalid size", () => {
    const invalidSize = "invalid" as ThemeSize;
    expect(getThemeSizeValuesByThemeSize(invalidSize)).toBe(theme.size.md);
  });

  test("getThemePixelSizeValuesByThemeSize returns correct pixel values for all sizes", () => {
    expect(getThemePixelSizeValuesByThemeSize(ThemeSize.ExtraSmall)).toBe(
      theme.size_pixels.xs,
    );
    expect(getThemePixelSizeValuesByThemeSize(ThemeSize.Small)).toBe(
      theme.size_pixels.sm,
    );
    expect(getThemePixelSizeValuesByThemeSize(ThemeSize.Medium)).toBe(
      theme.size_pixels.md,
    );
    expect(getThemePixelSizeValuesByThemeSize(ThemeSize.Large)).toBe(
      theme.size_pixels.lg,
    );
    expect(getThemePixelSizeValuesByThemeSize(ThemeSize.ExtraLarge)).toBe(
      theme.size_pixels.xl,
    );
    expect(getThemePixelSizeValuesByThemeSize(ThemeSize.TwoXL)).toBe(
      theme.size_pixels["2xl"],
    );
    expect(getThemePixelSizeValuesByThemeSize(ThemeSize.ThreeXL)).toBe(
      theme.size_pixels["3xl"],
    );
    expect(getThemePixelSizeValuesByThemeSize(ThemeSize.FourXL)).toBe(
      theme.size_pixels["4xl"],
    );
  });

  test("getThemePixelSizeValuesByThemeSize returns md pixel value as fallback for invalid size", () => {
    const invalidSize = "invalid" as ThemeSize;
    expect(getThemePixelSizeValuesByThemeSize(invalidSize)).toBe(
      theme.size_pixels.md,
    );
  });

  test("getThemePixelSizeValuesByThemeSize returns numeric pixel values", () => {
    // All pixel values should be numbers
    expect(typeof getThemePixelSizeValuesByThemeSize(ThemeSize.Small)).toBe(
      "number",
    );
    expect(typeof getThemePixelSizeValuesByThemeSize(ThemeSize.Medium)).toBe(
      "number",
    );
    expect(typeof getThemePixelSizeValuesByThemeSize(ThemeSize.Large)).toBe(
      "number",
    );
  });

  test("getThemeSizeValuesByThemeSize returns string size values", () => {
    // All size values should be strings (rem values)
    expect(typeof getThemeSizeValuesByThemeSize(ThemeSize.Small)).toBe(
      "string",
    );
    expect(typeof getThemeSizeValuesByThemeSize(ThemeSize.Medium)).toBe(
      "string",
    );
    expect(typeof getThemeSizeValuesByThemeSize(ThemeSize.Large)).toBe(
      "string",
    );
  });
});
