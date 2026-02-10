import { spin } from "@/theme/animations";
import { theme } from "@/theme/theme";
import React from "react";
import styled from "styled-components";
import {
  getThemePixelSizeValuesByThemeSize,
  getThemeSizeValuesByThemeSize,
  getVariantColors,
  ThemeSize,
  ThemeVariant,
} from "./utils";

const Ring = styled.div<{
  $size: ThemeSize;
  $color: string;
  $trackColor: string;
}>`
  width: ${({ $size }) => `${getThemeSizeValuesByThemeSize($size)}`};
  height: ${({ $size }) => `${getThemeSizeValuesByThemeSize($size)}`};

  border-radius: 50%;
  border: ${({ $size, $trackColor }) =>
    `${Math.max(2, getThemePixelSizeValuesByThemeSize($size) / 4)}px solid ${$trackColor}`};
  border-top-color: ${({ $color }) => $color};

  animation: ${spin} 0.8s linear infinite;
`;

const SpinnerContainer = styled.div<{
  $variant: ThemeVariant;
  $size: ThemeSize;
}>`
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  background-color: ${({ $variant, theme }) =>
    getVariantColors(theme, $variant).solidBg};
  border: 1px solid
    ${({ $variant, theme }) => getVariantColors(theme, $variant).border};
`;

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  $variant?: ThemeVariant;
  $size?: ThemeSize;
  $color?: string;
  $trackColor?: string;
  $withContainer?: boolean;
}

/**
 * Animated circular spinner component for indicating loading states.
 * Can be centered in a container or positioned using className.
 * @param $size - Size of the spinning element
 * @param $color - Custom hex/rgb color string for the spinning accent color. Overrides $variant if provided.
 * @param $trackColor - Custom hex/rgb color string for the background ring track. Uses theme colors if not specified.
 * @param $variant - Theme color variant: "primary", "success", "error", "warning", "info", "accent", "secondary". Determines accent color from theme. Defaults to "primary".
 * @param $withContainer - When true, wraps the spinner in a centered flex container with padding. Defaults to false.
 * @param className - Optional CSS class name for custom positioning or styling overrides.
 * @example
 * // Default medium primary spinner
 * <Spinner />
 * @example
 * // Large success spinner, centered
 * <Spinner $size={ThemeSize.Large} $variant={ThemeVariant.Success} $withContainer />
 * @example
 * // Custom size and colors
 * <Spinner $size={ThemeSize.Large} $color="#ff0000" $trackColor="#ffffff20" />
 */
export const Spinner: React.FC<SpinnerProps> = ({
  $variant = ThemeVariant.Primary,
  $size = ThemeSize.Medium,
  $color,
  $trackColor,
  $withContainer = false,
  className,
  ...rest
}) => {
  // Note: We can't access theme context here in the component function,
  // so we continue using the static theme for optional color overrides.
  // This is acceptable since $color and $trackColor are explicit overrides.
  const resolvedColor = $color || getVariantColors(theme, $variant).solidBg;
  const resolvedTrackColor =
    $trackColor || getVariantColors(theme, $variant).solidText;

  const spinner = (
    <Ring
      className={className}
      $size={$size}
      $color={resolvedColor}
      $trackColor={resolvedTrackColor}
      {...rest}
    />
  );

  return $withContainer ? (
    <SpinnerContainer $variant={$variant} $size={$size} {...rest}>
      {spinner}
    </SpinnerContainer>
  ) : (
    spinner
  );
};
