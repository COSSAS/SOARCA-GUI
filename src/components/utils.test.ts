import { darkTheme, theme } from "@/theme/theme";
import { describe, expect, test } from "vitest";
import {
  getIconPixelSize,
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
      expect(getVariantColors(theme, ThemeVariant.Primary)).toEqual(
        theme.colors.info,
      );
      expect(getVariantColors(theme, ThemeVariant.Accent)).toEqual(
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
      expect(getVariantColors(darkTheme, ThemeVariant.Primary)).toEqual(
        darkTheme.colors.info,
      );
      expect(getVariantColors(darkTheme, ThemeVariant.Accent)).toEqual(
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
        ThemeVariant.Primary,
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

  test("getIconPixelSize returns correct pixel values for all sizes", () => {
    expect(getIconPixelSize(ThemeSize.Small)).toBe(theme.icon_size.sm);
    expect(getIconPixelSize(ThemeSize.Medium)).toBe(theme.icon_size.md);
    expect(getIconPixelSize(ThemeSize.Large)).toBe(theme.icon_size.lg);
  });

  test("getIconPixelSize returns md pixel value as fallback for invalid size", () => {
    const invalidSize = "invalid" as ThemeSize;
    expect(getIconPixelSize(invalidSize)).toBe(
      theme.icon_size.md,
    );
  });

  test("getIconPixelSize returns numeric pixel values", () => {
    // All pixel values should be numbers
    expect(typeof getIconPixelSize(ThemeSize.Small)).toBe(
      "number",
    );
    expect(typeof getIconPixelSize(ThemeSize.Medium)).toBe(
      "number",
    );
    expect(typeof getIconPixelSize(ThemeSize.Large)).toBe(
      "number",
    );
  });
});
