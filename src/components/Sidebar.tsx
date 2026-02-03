import styled from "styled-components";

type SidebarWidth = "compact" | "normal" | "wide";

const sidebarWidths: Record<SidebarWidth, string> = {
  compact: "200px",
  normal: "280px",
  wide: "350px",
};

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  $isOpen: boolean;
  $maxWidth?: SidebarWidth;
}

/**
 * Sidebar component with responsive behavior and customizable max-width.
 * The sidebar will always attempt to fit its content but will not exceed the specified max-width.
 * @param $isOpen - Controls sidebar visibility on mobile (default: false)
 * @param $maxWidth - Sidebar max-width: "compact" | "normal" | "wide" (default: "normal")
 */
export const Sidebar = styled.aside<SidebarProps>`
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  width: auto;
  max-width: ${({ $maxWidth = "normal" }) => sidebarWidths[$maxWidth]};

  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};

  border-right: 1px solid ${({ theme }) => theme.colors.border.light};

  background-color: ${({ theme }) => theme.colors.background.primary};

  transition: width ${({ theme }) => theme.transitions.slow};

  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: ${({ theme }) => theme.zIndex.sticky};
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

export const SidebarLogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing.md};
`;

/**
 * Navigation item within the sidebar.
 * Highlights when active and changes appearance on hover.
 * @param $isActive - Whether the nav item is currently active (default: false)
 */
export const NavItem = styled.a<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;

  font: ${({ theme }) => theme.typography.bodyMedium.font};

  cursor: pointer;
  transition:
    color ${({ theme }) => theme.transitions.base},
    background-color ${({ theme }) => theme.transitions.base};

  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  border: none;

  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  gap: ${({ theme }) => theme.spacing.md};

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

export const SidebarFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md}
    0 ${({ theme }) => theme.spacing.md};

  border-top: 1px solid ${({ theme }) => theme.colors.border.light};
  margin-top: auto;
`;

export const SidebarFooterLink = styled.a`
  display: flex;
  align-items: center;

  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};

  font: ${({ theme }) => theme.typography.bodyMedium.font};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.radius.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;

  transition:
    color ${({ theme }) => theme.transitions.base},
    background-color ${({ theme }) => theme.transitions.base};

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => `${theme.colors.primary.main}26`};
  }
`;
