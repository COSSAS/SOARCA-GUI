import styled from "styled-components";
import {
  ButtonWidth,
  getThemeSizeValuesByThemeSize,
  getVariantColors,
  ThemeSize,
  ThemeVariant,
} from "./utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: ThemeVariant;
  $ghost?: boolean;
  $size?: ThemeSize;
  $width?: ButtonWidth;
}

/**
 * Button component with multiple variants, sizes, ghost mode (transparent background), and width options.
 * Supports all standard button HTML attributes and provides theme-based styling with smooth transitions.
 * Includes disabled state handling with reduced opacity and cursor changes.
 * @param $variant - Color variant: "primary" (main brand color), "secondary" (gray), "success" (green), "warning" (yellow), "error" (red), "info" (blue), "accent" (purple). Defaults to "info".
 * @param $ghost - When true, renders with transparent background and colored border/text. Hover fills with solid color. Defaults to false.
 * @param $size - Size preset: "sm" (small padding), "md" (medium padding), "lg" (large padding). Affects padding and maintains consistent typography. Defaults to "md".
 * @param $width - Width mode: "full" (100% width, useful in forms), "auto" (content-based width). Defaults to "auto".
 * @example
 * // Primary full-width button
 * <Button onClick={handleSubmit}>Submit</Button>
 * @example
 * // Ghost error button with auto width
 * <Button $variant="error" $ghost $width="auto" disabled>Delete</Button>
 * @example
 * // Large success button
 * <Button $variant="success" $size={ThemeSize.Large}>Complete Task</Button>
 */
export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: ${({ $size = ThemeSize.Medium }) =>
    getThemeSizeValuesByThemeSize($size)};
  width: ${({ $width = ButtonWidth.Auto }) =>
    $width === ButtonWidth.Full ? "100%" : "auto"};
  ${({ $size = ThemeSize.Medium, theme }) => {
    switch ($size) {
      case ThemeSize.Small:
        return `
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
        `;
      case ThemeSize.Medium:
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
        `;
      case ThemeSize.Large:
      default:
        return `
          padding: ${theme.spacing.md} ${theme.spacing.lg};
        `;
    }
  }}

  border-radius: ${({ theme }) => theme.radius.md};

  cursor: pointer;
  font: ${({ theme }) => theme.typography.bodyMedium.font};

  transition: all ${({ theme }) => theme.transitions.base};

  ${({ $variant = ThemeVariant.Info, $ghost, theme }) => {
    const colors = getVariantColors(theme, $variant);
    const baseBg = colors.solidBg;
    const hoverBg = colors.text;
    const textColor = colors.solidText;
    const borderColor = colors.border;
    const disabledColor = theme.colors.gray[300];
    const disabledText = theme.colors.gray[500];
    const disabledBorder = theme.colors.gray[500];

    // When ghost, the background is transparent and on hover it fills with the base color
    if ($ghost) {
      const ghostText = borderColor;
      const ghostHoverBg = baseBg;
      const ghostHoverText = textColor;
      return `
        background-color: transparent;
        color: ${ghostText};
        border: 1px solid ${borderColor};
        &:hover {
          background-color: ${ghostHoverBg};
          color: ${ghostHoverText};
        }
        &:disabled {
          background-color: transparent;
          color: ${disabledText};
          border-color: ${disabledBorder};
          cursor: not-allowed;
          opacity: 0.7;
        }
      `;
    }

    return `
      background-color: ${baseBg};
      color: ${textColor};
      border: 1px solid ${borderColor};
      &:hover {
        background-color: ${hoverBg};
        color: ${textColor};
      }
      &:disabled {
        background-color: ${disabledColor};
        border-color: ${disabledBorder};
        color: ${disabledText};
        cursor: not-allowed;
        opacity: 0.7;
      }
    `;
  }}

  &:active {
    // Slightly scale down on active press for feedback
    transform: scale(0.98);
  }
`;
