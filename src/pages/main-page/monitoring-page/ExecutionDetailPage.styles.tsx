import styled from "styled-components";

export const DetailsGrid = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 1600px) {
    padding-right: ${({ theme }) => theme.spacing.lg};
  }
`;

export const DetailsItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: flex-start;
`;

export const DetailsValue = styled.div`
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const ResponsiveLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 1600px) {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    align-items: start;
    gap: 0;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      left: calc(40%);
      top: 0;
      bottom: 0;
      width: 1px;
      background-color: ${({ theme }) => theme.colors.border.light};
    }
  }
`;

export const TabsSection = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};

  @media (min-width: 1600px) {
    padding-top: 0;
    padding-left: ${({ theme }) => theme.spacing.lg};
    border-top: none;
  }
`;

export const TabContent = styled.div`
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

export const NoStepsMessage = styled.div`
  display: flex;
  justify-content: center;
  padding-top: ${({ theme }) => theme.spacing.lg};
  overflow: hidden;
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};

  @media (min-width: 1600px) {
    padding-top: 0;
    padding-left: ${({ theme }) => theme.spacing.lg};
    border-top: none;
  }
`;
