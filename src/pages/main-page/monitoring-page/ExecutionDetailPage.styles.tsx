import styled from "styled-components";

export const ResponsiveLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: 1600px) {
    display: grid;
    /* minmax(0, ...) keeps the 1 : 1.5 split even when the right column
       holds wide content such as a long command line */
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr);
    align-items: stretch;
    gap: 0;
  }
`;

export const TabsSection = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border.light};

  @media (min-width: 1600px) {
    padding-top: 0;
    padding-left: ${({ theme }) => theme.spacing.lg};
    border-top: none;
    /* column divider; drawn by the column itself so it always sits on
       the boundary between the two columns */
    border-left: 1px solid ${({ theme }) => theme.colors.border.light};
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
    /* column divider; drawn by the column itself so it always sits on
       the boundary between the two columns */
    border-left: 1px solid ${({ theme }) => theme.colors.border.light};
  }
`;
