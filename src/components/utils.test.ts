import { darkTheme, theme } from "@/theme/theme";
import { describe, expect, test } from "vitest";
import {
  getThemePixelSizeValuesByThemeSize,
  getThemeSizeValuesByThemeSize,
  getVariantColors,
  ThemeSize,
  ThemeVariant,
} from "./utils";

describe("Component utility functions", () => {
  describe("getVariantColors", () => {
    test("returns correct colors for all variants with light theme", () => {
      expect(getVariantColors(theme, ThemeVariant.Success)).toEqual(
        theme.colors.success,
      );
      expect(getVariantColors(theme, ThemeVariant.Warning)).toEqual(
        theme.colors.warning,
      );
      expect(getVariantColors(theme, ThemeVariant.Error)).toEqual(
        theme.colors.error,
      );
      expect(getVariantColors(theme, ThemeVariant.Info)).toEqual(
        theme.colors.info,
      );
      expect(getVariantColors(theme, ThemeVariant.Primary)).toEqual(
        theme.colors.info,
      );
      expect(getVariantColors(theme, ThemeVariant.Accent)).toEqual(
        theme.colors.accent,
      );
      expect(getVariantColors(theme, ThemeVariant.Secondary)).toEqual(
        theme.colors.accent,
      );
    });

    test("returns correct colors for all variants with dark theme", () => {
      expect(getVariantColors(darkTheme, ThemeVariant.Success)).toEqual(
        darkTheme.colors.success,
      );
      expect(getVariantColors(darkTheme, ThemeVariant.Warning)).toEqual(
        darkTheme.colors.warning,
      );
      expect(getVariantColors(darkTheme, ThemeVariant.Error)).toEqual(
        darkTheme.colors.error,
      );
      expect(getVariantColors(darkTheme, ThemeVariant.Info)).toEqual(
        darkTheme.colors.info,
      );
      expect(getVariantColors(darkTheme, ThemeVariant.Primary)).toEqual(
        darkTheme.colors.info,
      );
      expect(getVariantColors(darkTheme, ThemeVariant.Accent)).toEqual(
        darkTheme.colors.accent,
      );
      expect(getVariantColors(darkTheme, ThemeVariant.Secondary)).toEqual(
        darkTheme.colors.accent,
      );
    });

    test("returns different colors for light and dark themes", () => {
      const lightSuccess = getVariantColors(theme, ThemeVariant.Success);
      const darkSuccess = getVariantColors(darkTheme, ThemeVariant.Success);

      expect(lightSuccess.bg).not.toBe(darkSuccess.bg);
      expect(lightSuccess.text).not.toBe(darkSuccess.text);
      expect(lightSuccess.border).not.toBe(darkSuccess.border);
    });

    test("has consistent structure across all variants", () => {
      const variants = [
        ThemeVariant.Success,
        ThemeVariant.Warning,
        ThemeVariant.Error,
        ThemeVariant.Info,
        ThemeVariant.Accent,
      ];

      variants.forEach((variant) => {
        const colors = getVariantColors(theme, variant);
        expect(colors).toHaveProperty("bg");
        expect(colors).toHaveProperty("border");
        expect(colors).toHaveProperty("text");
        expect(colors).toHaveProperty("solidBg");
        expect(colors).toHaveProperty("solidText");
        expect(typeof colors.bg).toBe("string");
        expect(typeof colors.border).toBe("string");
        expect(typeof colors.text).toBe("string");
        expect(typeof colors.solidBg).toBe("string");
        expect(typeof colors.solidText).toBe("string");
      });
    });
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
