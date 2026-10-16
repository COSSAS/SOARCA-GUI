import { Children } from "react";
import styled from "styled-components";
import { ControlLabel } from "./Typography";
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
 * @param $variant - Color variant: "primary" (blue), "success" (green), "warning" (yellow), "error" (red), "accent" (purple). Defaults to "primary".
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
export const Button = styled.button.attrs<ButtonProps>(({ children }) => ({
  children: Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number"
      ? <ControlLabel>{child}</ControlLabel>
      : child,
  ),
}))`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ $size = ThemeSize.Medium }) =>
    getThemeSizeValuesByThemeSize($size)};

  ${({ $width }) => ($width === ButtonWidth.Full ? "width: 100%;" : "")}

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

  ${({ $variant = ThemeVariant.Primary, $ghost, theme }) => {
    const colors = getVariantColors(theme, $variant);
    const darken = (amount: string) =>
      `color-mix(in srgb, ${colors.solidBg}, ${theme.colors.shade} ${amount})`;
    const hoverBg = $ghost
      ? colors.solidBg
      : darken(theme.interactions.hoverDarken);
    const activeBg = darken(theme.interactions.activeDarken);
    const disabledBorder = $ghost
      ? theme.colors.gray[500]
      : theme.colors.gray[300];

    // A filled button always has a border in the same color as its fill.
    return `
      border: 1px solid ${$ghost ? colors.border : colors.solidBg};
      background-color: ${$ghost ? "transparent" : colors.solidBg};

      color: ${$ghost ? colors.border : colors.solidText};

      &:hover:not(:disabled) {
        border-color: ${hoverBg};
        background-color: ${hoverBg};
      }

      &:active:not(:disabled) {
        border-color: ${activeBg};
        background-color: ${activeBg};
      }

      ${
        $ghost
          ? `
        &:is(:hover, :active):not(:disabled) {
          color: ${colors.solidText};
        }
      `
          : ""
      }

      &:disabled {
        border-color: ${disabledBorder};
        background-color: ${$ghost ? "transparent" : theme.colors.gray[300]};
        opacity: ${theme.interactions.disabledOpacity};

        color: ${theme.colors.gray[500]};

        cursor: not-allowed;
      }
    `;
  }}

  font: ${({ theme }) => theme.typography.bodyMedium.font};

  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};
`;
