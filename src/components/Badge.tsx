import styled from "styled-components";
import { BadgeShape, ThemeVariant, getVariantColors } from "./utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  $variant?: ThemeVariant;
  $shape?: BadgeShape;
  $isInteractive?: boolean;
}

/**
 * Badge component for compact status/label pills.
 * Displays colored badges with different variants (success, warning, error, info) and shapes.
 * Supports interactive mode with hover effects for clickable badges.
 * @param $variant - Visual variant using ThemeVariant enum.
 * @param $shape - Shape of the badge: BadgeShape.Pill (fully rounded ends) or BadgeShape.Rounded (medium border radius). Defaults to Pill.
 * @param $isInteractive - When true, adds hover/active states including translateY animation and shadow for clickable badges. Defaults to false.
 * @example
 *  // Simple success badge
 *  <Badge $variant={ThemeVariant.Success}>Active</Badge>
 * @example
 *  // Interactive warning badge with rounded shape
 *  <Badge $variant={ThemeVariant.Warning} $shape={BadgeShape.Rounded} $isInteractive>Click me</Badge>
 */
export const Badge = styled.span<BadgeProps>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};

  border-radius: ${({ $shape = BadgeShape.Pill, theme }) =>
    $shape === BadgeShape.Rounded ? theme.radius.md : theme.radius.full};
  border: 1px solid
    ${({ $variant = ThemeVariant.Info, theme }) =>
      getVariantColors(theme, $variant).border};

  font: ${({ theme }) => theme.typography.small.font};
  line-height: ${({ theme }) => theme.fonts.lineHeight.mini};

  background: ${({ $variant = ThemeVariant.Info, theme }) =>
    getVariantColors(theme, $variant).bg};
  color: ${({ $variant = ThemeVariant.Info, theme }) =>
    getVariantColors(theme, $variant).text};

  ${({ $isInteractive, theme }) =>
    $isInteractive
      ? `
        cursor: pointer;
        transition: transform ${theme.transitions.base},
          box-shadow ${theme.transitions.base};
        &:hover {
          transform: translateY(-1px);
          box-shadow: ${theme.shadows.sm};
        }
        &:active {
          transform: translateY(0);
        }
      `
      : ""}
`;
