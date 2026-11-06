import styled from "styled-components";

import { PopoverContent, PopoverItemButton } from "@/components/Popover.styles";

import { tint } from "./colors";

// Placed with explicit left/top from menuPosition.ts, so anchor positioning is switched off.
export const ContextMenuSurface = styled(PopoverContent).attrs({
  $anchorName: "none",
})`
  position: fixed;
  position-area: none;
  position-try-fallbacks: none;

  overflow: auto;
  overscroll-behavior: contain;

  margin: 0;

  box-shadow: ${({ theme }) => theme.shadows.md};

  &:focus {
    outline: none;
  }
`;

export const ContextMenuItem = PopoverItemButton;

export const ContextMenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const SubmenuTrigger = styled(ContextMenuItem)<{ $open: boolean }>`
  justify-content: space-between;
  background: ${({ theme, $open }) =>
    $open ? tint(theme, theme.colors.info.solidBg) : undefined};
`;

export const ContextMenuSeparator = styled.div`
  height: 1px;
  margin: ${({ theme }) => `${theme.spacing.xs} 0`};
  background: ${({ theme }) => theme.colors.border.light};
`;