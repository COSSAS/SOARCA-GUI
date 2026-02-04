import styled from "styled-components";

export const MainWrapper = styled.div`
  height: 100vh;
  display: flex;
  overflow: hidden;
`;

export const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export const MainHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;

  background-color: ${({ theme }) => theme.colors.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  min-height: 2rem;

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
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.lg};
  min-width: 550px;
  background-color: ${({ theme }) => theme.colors.secondary.bg};
`;

export const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;

  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: ${({ $isOpen }) => ($isOpen ? "block" : "none")};
    position: fixed;
    inset: 0;
    background-color: ${({ theme }) => theme.colors.background.overlay};
    z-index: ${({ theme }) => theme.zIndex.overlay};
  }
`;
