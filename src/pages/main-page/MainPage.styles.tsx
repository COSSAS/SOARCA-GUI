import styled from "styled-components";

export const MainWrapper = styled.div`
  overflow: hidden;
  display: flex;
  height: 100vh;
`;

export const ContentArea = styled.div`
  overflow: hidden;
  display: flex;
  flex: 1;
  flex-direction: column;
`;

export const MainHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;

  min-height: 4rem;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};

  background-color: ${({ theme }) => theme.colors.background.primary};

  @media (max-width: 768px) {
    .mobile-logo {
      display: block !important;
    }
    .mobile-menu {
      order: 1;
    }
    .status-indicator {
      order: 2;
    }
  }
`;

export const MainContent = styled.main`
  scrollbar-gutter: stable;

  overflow-y: auto;
  flex: 1;

  min-width: 550px;
  padding: ${({ theme }) => theme.spacing.lg};

  background-color: ${({ theme }) => theme.colors.secondary.bg};
`;

export const MobileMenuButton = styled.button`
  display: none;
  color: ${({ theme }) => theme.colors.text.primary};

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;

  @media (max-width: 768px) {
    position: fixed;
    z-index: ${({ theme }) => theme.zIndex.overlay};
    inset: 0;

    display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};

    background-color: ${({ theme }) => theme.colors.background.overlay};
    backdrop-filter: blur(${({ theme }) => theme.effects.backdropBlur});
  }
`;
