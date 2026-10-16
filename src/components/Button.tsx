import styled from "styled-components";
import {
  ButtonWidth,
  getControlSize,
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
 * @param $size - Size preset, shared with Input and Select: "sm" (28px, 14px text), "md" (34px), "lg" (42px). Defaults to "md".
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

  ${({ $width }) => ($width === ButtonWidth.Full ? "width: 100%;" : "")}

  ${({ $size = ThemeSize.Medium, theme }) => {
    const { height, paddingX, gap } = getControlSize(theme, $size);
    return `
      gap: ${gap};
      height: ${height};
      padding: 0 ${paddingX};
    `;
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
  font-size: ${({ $size = ThemeSize.Medium, theme }) =>
    getControlSize(theme, $size).fontSize};

  transition:
    background-color ${({ theme }) => theme.transitions.fast},
    border-color ${({ theme }) => theme.transitions.fast},
    color ${({ theme }) => theme.transitions.fast};
`;
