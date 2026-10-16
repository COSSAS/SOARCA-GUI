import type { TablerIcon } from "@tabler/icons-react";
import styled from "styled-components";
import { ControlLabel } from "./Typography";
import {
  getThemePixelSizeValuesByThemeSize,
  getVariantColors,
  ThemeSize,
  ThemeVariant,
} from "./utils";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  $icon: TablerIcon;
  $size?: ThemeSize;
  $variant?: ThemeVariant;
  $ghost?: boolean;
  $round?: boolean;
  $stroke?: number;
}

const IconWrapper = styled.span<{
  $size: number;
  $variant?: ThemeVariant;
  $ghost?: boolean;
  $round?: boolean;
}>`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  vertical-align: middle;

  height: ${({ $size, $round }) =>
    $round ? `${$size + $size * 0.5}px` : `${$size}px`};
  width: ${({ $size, $round }) =>
    $round ? `${$size + $size * 0.5}px` : `${$size}px`};

  ${({ $round }) => $round ? "border-radius: 50%;" : ""}

  &:has(+ ${ControlLabel}),
  ${ControlLabel} + & {
    align-self: baseline;
    translate: 0 calc(50% - 0.5cap);
  }

  ${({ $variant, $ghost, $round, theme }) => {
    if (!$round || !$variant) return "";

    const colors = getVariantColors(theme, $variant);

    return `
      border: 1px solid ${colors.border};
      background-color: ${$ghost ? "transparent" : colors.solidBg};

      color: ${$ghost ? colors.border : colors.solidText};
    `;
  }}

`;

/**
 * Renders Tabler icons with theme sizes and optional round containers.
 * @param $icon - Tabler icon component from @tabler/icons-react
 * @param $size - ThemeSize enum (default: ThemeSize.Large, corrisponding to 16px)
 * @param $variant - "primary" | "success" | "warning" | "error" | "accent" (only used with $round)
 * @param $ghost - boolean (default: false) - renders transparent background with colored border (only used with $round)
 * @param $round - boolean (default: false) - renders icon in a round container with variant colors
 * @param $stroke - number (default: 2) - stroke width of the icon
 * @example
 * <Icon $icon={IconHome} $size={ThemeSize.Large} />
 * <Icon $icon={IconExclamationCircle} $size={ThemeSize.ExtraLarge} $round $variant={ThemeVariant.Warning} />
 * <Icon $icon={IconCircleCheck} $size={ThemeSize.Large} $round $variant={ThemeVariant.Success} $ghost />
 */
export const Icon: React.FC<IconProps> = ({
  $icon: IconComponent,
  $size = ThemeSize.Large,
  $variant,
  $ghost = false,
  $round = false,
  $stroke = 2,
  ...rest
}) => {
  const pixelSize = getThemePixelSizeValuesByThemeSize($size);

  return (
    <IconWrapper
      $size={pixelSize}
      $variant={$variant}
      $ghost={$ghost}
      $round={$round}
      {...rest}
    >
      <IconComponent size={pixelSize} stroke={$stroke} />
    </IconWrapper>
  );
};

export default Icon;
