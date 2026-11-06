import styled, { css } from "styled-components";

import { Button } from "./Button";

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  $isOpen: boolean;
  $collapsed?: boolean;
}

/**
 * App sidebar. On desktop it can collapse to an icon rail. The icons keep their
 * place in both states, so only the width animates and the labels get clipped.
 * @param $isOpen - Controls sidebar visibility on mobile (default: false)
 * @param $collapsed - Shows only icons (default: false)
 */
export const Sidebar = styled.aside<SidebarProps>`
  overflow: hidden auto;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing.lg};

  width: ${({ $collapsed }) => ($collapsed ? "4.5rem" : "15rem")};
  padding: ${({ theme }) => theme.spacing.lg};
  border-right: ${({ theme, $collapsed }) =>
    $collapsed
      ? `2px solid ${theme.colors.primary.main}`
      : `1px solid ${theme.colors.border.light}`};

  white-space: nowrap;

  background-color: ${({ theme }) => theme.colors.background.primary};

  transition: width ${({ theme }) => theme.transitions.base};

  @media (max-width: 768px) {
    position: fixed;
    z-index: ${({ theme }) => theme.zIndex.sticky};
    top: 0;
    bottom: 0;
    left: 0;
    transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "-100%")});

    transition: transform ${({ theme }) => theme.transitions.slow};
  }
`;

export const SidebarHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  padding-top: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

export const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const fade = css<{ $hidden: boolean }>`
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  transition: opacity ${({ theme }) => theme.transitions.base};
`;

// Both logos stay mounted and cross-fade. The small one is centered on the icon column.
export const SidebarLogos = styled.div`
  position: relative;
  height: 2rem;
`;

export const SidebarLogo = styled.img<{ $hidden: boolean; $small?: boolean }>`
  position: absolute;
  top: 0;
  left: ${({ theme, $small }) => ($small ? "0.25rem" : theme.spacing.md)};

  width: ${({ $small }) => ($small ? "2rem" : "11.5rem")};
  height: 100%;

  ${fade}
`;

export const SidebarLabel = styled.span<{ $hidden: boolean }>`
  ${fade}
`;

/**
 * The primary action at the top. Its label shrinks to nothing when collapsed,
 * so the centered icon slides along with the width instead of jumping.
 */
export const SidebarAction = styled(Button)`
  gap: 0;
`;

export const SidebarActionLabel = styled.span<{ $hidden: boolean }>`
  overflow: hidden;

  max-width: ${({ $hidden }) => ($hidden ? 0 : "10rem")};
  margin-left: ${({ theme, $hidden }) => ($hidden ? 0 : theme.spacing.sm)};

  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};

  transition:
    max-width ${({ theme }) => theme.transitions.base},
    margin ${({ theme }) => theme.transitions.base},
    opacity ${({ theme }) => theme.transitions.base};
`;

/**
 * Navigation item within the sidebar.
 * Highlights when active and changes appearance on hover.
 * @param $isActive - Whether the nav item is currently active (default: false)
 */
export const NavItem = styled.a<{ $isActive?: boolean }>`
  cursor: pointer;

  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;

  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.radius.md};

  font: ${({ theme }) => theme.typography.bodyMedium.font};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;

  transition:
    color ${({ theme }) => theme.transitions.base},
    background-color ${({ theme }) => theme.transitions.base};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => `${theme.colors.primary.main}26`};
  }

  ${({ $isActive, theme }) =>
    $isActive
      ? `
        color: ${theme.colors.primary.hover};
        background-color: ${theme.colors.primary.hover}33;`
      : ""}
`;

// Icon-only items in a centered row that wraps into a column in the collapsed rail.
export const SidebarFooter = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  justify-content: center;

  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};

  & > ${NavItem} {
    width: auto;
  }

  @media (max-width: 768px) {
    & > button {
      display: none;
    }
  }
`;