import { spin } from "@/theme/animations";
import { IconCircle, IconLoader2 } from "@tabler/icons-react";
import React from "react";
import styled, { useTheme } from "styled-components";
import {
  getIconPixelSize,
  getVariantColors,
  ThemeSize,
  ThemeVariant,
} from "./utils";

const Ring = styled.div<{ $px: number }>`
  position: relative;
  width: ${({ $px }) => `${$px}px`};
  height: ${({ $px }) => `${$px}px`};

  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .tabler-icon-loader-2 {
    animation: ${spin} 0.8s linear infinite;
  }
`;

const SpinnerContainer = styled.div<{ $variant: ThemeVariant; $px: number }>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: ${({ $px }) => `${$px}px`};
  height: ${({ $px }) => `${$px}px`};

  border-radius: 50%;

  background-color: ${({ $variant, theme }) =>
    getVariantColors(theme, $variant).solidBg};
  border: 1px solid
    ${({ $variant, theme }) => getVariantColors(theme, $variant).solidBg};
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
 * @param $size - Size on the icon scale (see Icon). The ring is drawn around it, so the spinner is 1.5x that size. Defaults to Medium.
 * @param $color - Custom CSS color for the spinning arc. Overrides $variant if provided.
 * @param $trackColor - Custom CSS color for the background ring track. Uses theme colors if not specified.
 * @param $variant - Theme color variant: "primary", "success", "error", "warning", "accent". Defaults to "primary".
 * @param $withContainer - When true, draws a white spinner on a filled circle in the variant color, matching a round Icon of the same size. Defaults to false.
 * @param className - Optional CSS class name for custom positioning or styling overrides.
 * @example
 * // Default medium primary spinner
 * <Spinner />
 * @example
 * // Spinner next to round icons
 * <Spinner $variant={ThemeVariant.Warning} $withContainer />
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
  const colors = getVariantColors(useTheme(), $variant);
  const arcColor = $color || ($withContainer ? colors.solidText : colors.solidBg);
  const trackColor = $trackColor || ($withContainer ? colors.solidText : colors.bg);
  const trackOpacity = $withContainer && !$trackColor ? 0.35 : 1;

  const pixelSize = getIconPixelSize($size);
  const borderWidth = Math.max(2, pixelSize / 4);
  // In a container the spinner sits inside the circle like the glyph of a round Icon.
  const ringSize = $withContainer ? pixelSize : pixelSize + borderWidth * 2;
  const stroke = $withContainer ? 2.5 : (borderWidth / ringSize) * 24;

  const spinner = (
    <Ring
      className={$withContainer ? undefined : className}
      $px={ringSize}
      {...($withContainer ? {} : rest)}
    >
      <IconCircle
        color={trackColor}
        opacity={trackOpacity}
        stroke={stroke}
        aria-hidden="true"
      />
      <IconLoader2 color={arcColor} stroke={stroke} aria-hidden="true" />
    </Ring>
  );

  return $withContainer ? (
    <SpinnerContainer
      className={className}
      $variant={$variant}
      $px={pixelSize * 1.5}
      {...rest}
    >
      {spinner}
    </SpinnerContainer>
  ) : (
    spinner
  );
};
