import { LucideIcon } from "lucide-react";
import styled from "styled-components";
import {
  getThemePixelSizeValuesByThemeSize,
  getVariantColors,
  ThemeSize,
  ThemeVariant,
} from "./utils";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  $icon: LucideIcon;
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
  align-items: center;
  justify-content: center;

  // small calculations to add padding when round.
  height: ${({ $size, $round }) =>
    $round ? `${$size + $size * 0.5}px` : `${$size}px`};
  width: ${({ $size, $round }) =>
    $round ? `${$size + $size * 0.5}px` : `${$size}px`};

  border-radius: ${({ $round }) => ($round ? "50%" : "0")};

  transition: all ${({ theme }) => theme.transitions.base};

  ${({ $variant, $ghost, $round, theme }) => {
    if (!$round || !$variant) return "";

    const colors = getVariantColors(theme, $variant);
    const baseBg = colors.solidBg;
    const textColor = colors.solidText;
    const borderColor = colors.border;

    if ($ghost) {
      return `
        background-color: transparent;
        color: ${borderColor};
        border: 1px solid ${borderColor};
      `;
    }

    return `
      background-color: ${baseBg};
      color: ${textColor};
      border: 1px solid ${borderColor};
    `;
  }}

  svg {
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
  }
`;

/**
 * Icon component to render Lucide icons with specified sizes and optional round container with variants.
 * @param $icon - LucideIcon component to render (copy the JSX name from @link https://lucide.dev/icons/)
 * @param $size - ThemeSize enum (default: ThemeSize.Large, corrisponding to 16px)
 * @param $variant - "primary" | "secondary" | "success" | "warning" | "error" | "info" (only used with $round)
 * @param $ghost - boolean (default: false) - renders transparent background with colored border (only used with $round)
 * @param $round - boolean (default: false) - renders icon in a round container with variant colors
 * @param $stroke - number (default: 2) - stroke width of the icon
 * @example
 * <Icon $icon={Home} $size={ThemeSize.Large} />
 * <Icon $icon={BadgeAlert} $size={ThemeSize.ExtraLarge} $round $variant={ThemeVariant.Warning} />
 * <Icon $icon={CheckCircle} $size={ThemeSize.Large} $round $variant={ThemeVariant.Success} $ghost />
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
      <IconComponent size={pixelSize} strokeWidth={$stroke} />
    </IconWrapper>
  );
};

export default Icon;
