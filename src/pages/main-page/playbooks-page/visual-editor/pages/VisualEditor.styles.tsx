import styled, { css } from "styled-components";

import { PANEL_WIDTH, panelWidth, type Side } from "./panelWidth";

const PANEL_BORDERS_WIDTH = "2px";

const fadeWhenCollapsed = css<{ $collapsed: boolean }>`
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  transition: opacity ${({ theme }) => theme.transitions.base};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

// Fills the page content area; MainContent has a fixed height, so 100% is enough.
export const EditorLayout = styled.div<{
  $leftCollapsed: boolean;
  $rightCollapsed: boolean;
}>`
  display: grid;
  grid-template-columns:
    ${({ $leftCollapsed }) => panelWidth("left", $leftCollapsed)}
    minmax(0, 1fr)
    ${({ $rightCollapsed }) => panelWidth("right", $rightCollapsed)};
  grid-template-rows: auto minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};

  height: 100%;
  min-height: 35rem;

  transition: grid-template-columns ${({ theme }) => theme.transitions.base};

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export const Toolbar = styled.div`
  display: flex;
  grid-column: 1 / -1;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

export const ToolbarTitle = styled.h2`
  flex: 1;
  margin: 0;
  font: ${({ theme }) => theme.typography.h2.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

// The edge facing the canvas turns primary while collapsed.
export const SidePanel = styled.aside<{ $side: Side; $collapsed: boolean }>`
  overflow: hidden;
  display: flex;
  flex-direction: column;

  min-height: 0;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-inline-start-color: ${({ theme, $side, $collapsed }) =>
    $side === "right" && $collapsed
      ? theme.colors.primary.main
      : theme.colors.border.light};
  border-inline-end-color: ${({ theme, $side, $collapsed }) =>
    $side === "left" && $collapsed
      ? theme.colors.primary.main
      : theme.colors.border.light};

  background: ${({ theme }) => theme.colors.background.primary};
`;

// The toggle sits on the canvas side and keeps its place while the panel shrinks.
export const SidePanelHeader = styled.div<{ $side: Side }>`
  display: flex;
  flex-direction: ${({ $side }) => ($side === "left" ? "row-reverse" : "row")};
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

  padding-block: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.sm}`};
  padding-inline: ${({ theme, $side }) =>
    $side === "left"
      ? `${theme.spacing.lg} ${theme.spacing.xs}`
      : `${theme.spacing.xs} ${theme.spacing.lg}`};
`;

export const SidePanelHeading = styled.div<{ $collapsed: boolean }>`
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

  min-width: 0;

  ${fadeWhenCollapsed}
`;

export const SidePanelTitle = styled.h3`
  overflow: hidden;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

  min-width: 0;
  margin: 0;

  font: ${({ theme }) => theme.typography.h3.font};
  color: ${({ theme }) => theme.colors.text.primary};
  white-space: nowrap;
`;

export const SidePanelToggle = styled.button`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;

  width: 2rem;
  height: 2rem;
  border-radius: ${({ theme }) => theme.radius.md};

  color: ${({ theme }) => theme.colors.primary.main};

  &:hover {
    background: ${({ theme }) => theme.colors.background.secondary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary.main};
    outline-offset: -2px;
  }
`;

// Fixed width so the content does not reflow while the panel animates.
export const SidePanelContent = styled.div<{ $side: Side; $collapsed: boolean }>`
  overflow-y: auto;
  flex: 1;

  width: calc(${({ $side }) => PANEL_WIDTH[$side]} - ${PANEL_BORDERS_WIDTH});
  min-height: 0;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg} ${theme.spacing.lg}`};

  ${fadeWhenCollapsed}
`;
