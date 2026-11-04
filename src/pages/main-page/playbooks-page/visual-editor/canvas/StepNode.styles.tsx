import { Handle } from "@xyflow/react";
import styled, { css } from "styled-components";

import { PORT_GAP } from "../model/layout";
import type { ConnectionKind, StepColor } from "../model/specs";
import { getConnectionColor, getStepColors, tint } from "./colors";

export const NodeCard = styled.div<{
  $color: StepColor;
  $selected: boolean;
  $width: number;
}>`
  ${({ theme, $color, $selected, $width }) => {
    const main = getStepColors(theme, $color).solidBg;
    return css`
      position: relative;

      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.sm};

      width: ${$width}px;
      padding: ${theme.spacing.md};
      /* Room for the top half of the badges on the bottom border. */
      padding-bottom: ${theme.spacing.lg};
      border: 1px solid ${$selected ? main : theme.colors.border.light};
      border-top: ${theme.spacing.xs} solid ${main};

      background: ${theme.colors.background.primary};
      box-shadow: ${theme.shadows.sm};

      transition: border-color ${theme.transitions.fast};

      &:hover {
        border-color: ${main};
      }
    `;
  }}
`;

export const NodeHeader = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const ellipsis = css`
  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const IssueMarker = styled.span<{ $blocking: boolean }>`
  display: inline-flex;
  color: ${({ theme, $blocking }) =>
    $blocking ? theme.colors.error.text : theme.colors.warning.text};
`;

export const NodeType = styled.span`
  ${ellipsis}
  flex: 1;

  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const NodeTitle = styled.div`
  ${ellipsis}
  font: ${({ theme }) => theme.typography.h3.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

// A badge sitting on the bottom border. React Flow centres it on the border; the step
// spreads the badges out with an inline `left`. `&&` beats React Flow's handle styles.
// Each badge is capped to its slot, so neighbours never overlap.
export const PortHandle = styled(Handle)<{
  $kind: ConnectionKind;
  $linked: boolean;
}>`
  ${({ theme, $kind, $linked }) => {
    const main = getConnectionColor(theme, $kind);
    return css`
      && {
        cursor: crosshair;

        overflow: hidden;

        width: auto;
        min-width: 0;
        max-width: ${PORT_GAP - 8}px;
        height: auto;
        min-height: 0;
        padding: 0 ${theme.spacing.sm};
        border: 1px solid
          ${
            $linked
              ? main
              : `color-mix(in srgb, ${main}, ${theme.colors.border.light})`
          };
        border-radius: ${theme.radius.full};

        font: ${theme.typography.small.font};
        line-height: ${theme.fonts.lineHeight.normal};
        color: ${$linked ? main : theme.colors.text.secondary};
        text-overflow: ellipsis;
        white-space: nowrap;

        background: ${$linked ? tint(theme, main) : theme.colors.background.primary};
      }

      &&.connectable:hover,
      &&.connectingfrom {
        border-color: ${main};
        color: ${main};
        background: ${tint(theme, main)};
      }

      &&.react-flow__handle:not(.connectable) {
        cursor: default;
      }
    `;
  }}
`;

// Only an end point for arrows when several arrive at one step; connecting uses TargetHandle.
export const IncomingHandle = styled(Handle)`
  && {
    pointer-events: none;

    width: 1px;
    min-width: 0;
    /* Same height as TargetHandle so arrow tips stop at the same point. */
    height: ${({ theme }) => theme.spacing.sm};
    min-height: 0;
    border: none;

    background: transparent;
  }
`;

// Invisible until a connection is dragged; then it covers the whole step so it is easy to hit.
export const TargetHandle = styled(Handle)<{ $incomingKind?: ConnectionKind }>`
  && {
    width: ${({ theme }) => theme.spacing.sm};
    min-width: 0;
    height: ${({ theme }) => theme.spacing.sm};
    min-height: 0;
    border: none;

    background: transparent;
  }

  ${({ $incomingKind, theme }) => {
    if (!$incomingKind) return "";
    const main = getConnectionColor(theme, $incomingKind);
    // See-through, so the step stays readable under the cover.
    const veil = (color: string) =>
      `color-mix(in srgb, ${color} ${theme.interactions.subtleMix}, transparent)`;
    return css`
      && {
        z-index: 1;
        inset: 0;
        transform: none;

        width: auto;
        height: auto;
        border-radius: 0;
      }
      &&.connectingto {
        cursor: not-allowed;
        background: ${veil(theme.colors.text.tertiary)};
        outline: 2px dashed ${theme.colors.text.tertiary};
      }
      &&.connectingto.valid {
        cursor: crosshair;
        background: ${veil(main)};
        outline: 2px solid ${main};
      }
    `;
  }}
`;
