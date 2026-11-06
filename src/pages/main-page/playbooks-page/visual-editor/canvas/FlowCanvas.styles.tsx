import styled from "styled-components";

import { CONNECTION_COLORS } from "../model/rules";
import type { ConnectionKind } from "../model/specs";
import { darken, getConnectionColor } from "./colors";

/** Maps React Flow's CSS variables to the GUI theme, so light and dark mode just work. */
export const CanvasWrapper = styled.div`
  position: relative;

  overflow: hidden;

  width: 100%;
  height: 100%;
  border: 1px solid ${({ theme }) => theme.colors.border.light};

  .react-flow {
    --xy-background-color: ${({ theme }) => theme.colors.background.tertiary};
    --xy-background-pattern-dots-color: ${({ theme }) =>
      theme.colors.border.medium};
    --xy-edge-stroke: ${({ theme }) => theme.colors.text.tertiary};
    --xy-edge-stroke-width: 1.5;
    --xy-connectionline-stroke: ${({ theme }) => theme.colors.text.tertiary};
    --xy-node-boxshadow-hover: none;
    --xy-node-boxshadow-selected: none;
    --xy-controls-button-background-color: ${({ theme }) =>
      theme.colors.background.primary};
    --xy-controls-button-background-color-hover: ${({ theme }) =>
      theme.colors.background.secondary};
    --xy-controls-button-color: ${({ theme }) => theme.colors.text.primary};
    --xy-controls-button-color-hover: ${({ theme }) =>
      theme.colors.text.primary};
    --xy-controls-button-border-color: ${({ theme }) =>
      theme.colors.border.light};
    --xy-controls-box-shadow: ${({ theme }) => theme.shadows.base};
    --xy-minimap-background-color: ${({ theme }) =>
      theme.colors.background.primary};
    --xy-minimap-mask-background-color: ${({ theme }) =>
      theme.colors.background.overlay};
    --xy-minimap-node-background-color: ${({ theme }) =>
      theme.colors.border.medium};
    --xy-attribution-background-color: transparent;
  }

  .react-flow__minimap {
    overflow: hidden;
    border: 1px solid ${({ theme }) => theme.colors.border.light};
  }

  /* Each connection kind has its own edge colour. */
  ${({ theme }) =>
    (Object.keys(CONNECTION_COLORS) as ConnectionKind[])
      .map(
        (kind) =>
          `.edge-${kind} { --xy-edge-stroke: ${getConnectionColor(theme, kind)}; }`,
      )
      .join("\n")}

  /* Hover and selection look the same: the edge's own colour, a bit darker and thicker. */
  .react-flow__edge {
    --xy-edge-stroke-selected: ${({ theme }) =>
      darken(theme, "var(--xy-edge-stroke)", theme.interactions.hoverDarken)};
  }

  .react-flow__edge.selectable:hover .react-flow__edge-path,
  .react-flow__edge.selected .react-flow__edge-path {
    stroke: var(--xy-edge-stroke-selected);
    stroke-width: 2.5;
  }

  /* Arrow heads take the colour of the edge that uses them. */
  .react-flow__arrowhead polyline.arrowclosed {
    fill: context-stroke;
    stroke: context-stroke;
  }

  /* Smaller than React Flow's default 200 x 150 on laptop screens. */
  @media (max-width: 1600px) {
    .react-flow__minimap-svg {
      width: 7.5rem;
      height: 5.625rem;
    }
  }
`;
