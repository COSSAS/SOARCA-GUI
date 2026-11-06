import type { DefaultTheme } from "styled-components";

import { getVariantColors, type VariantColors } from "@/components/utils";

import { CONNECTION_COLORS } from "../model/rules";
import type { ConnectionKind, StepColor } from "../model/specs";

type Hue = keyof DefaultTheme["colors"]["hues"];

const isHue = (theme: DefaultTheme, color: StepColor): color is Hue =>
  color in theme.colors.hues;

export const getStepColors = (
  theme: DefaultTheme,
  color: StepColor,
): VariantColors =>
  isHue(theme, color)
    ? theme.colors.hues[color]
    : getVariantColors(theme, color);

/** The main colour of a connection: its edges, arrow heads and ports derive from it. */
export const getConnectionColor = (
  theme: DefaultTheme,
  kind: ConnectionKind,
): string => getStepColors(theme, CONNECTION_COLORS[kind]).border;

/** Mixes the shade into a colour, like the hover and active states of Button. */
export const darken = (theme: DefaultTheme, color: string, amount: string) =>
  `color-mix(in srgb, ${color}, ${theme.colors.shade} ${amount})`;

/** A light tint of a colour on the page background. */
export const tint = (theme: DefaultTheme, color: string) =>
  `color-mix(in srgb, ${color} ${theme.interactions.subtleMix}, ${theme.colors.background.primary})`;
