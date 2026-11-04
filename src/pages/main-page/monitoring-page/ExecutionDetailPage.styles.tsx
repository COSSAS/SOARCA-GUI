import styled from "styled-components";

export const DetailsGrid = styled.div`
  display: grid;
  /* minmax(0, ...) stops long unbreakable values (IDs, commands) from
     widening a track and pushing content out of the grid */
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  align-content: start;

  width: 100%;

  @media (min-width: 1600px) {
    padding-right: ${({ theme }) => theme.spacing.lg};
  }
`;

export const DetailsItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: flex-start;

  min-width: 0;

  overflow-wrap: anywhere;
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
    /* minmax(0, ...) keeps the 1 : 1.5 split even when the right column
       holds wide content such as a long command line */
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr);
    gap: 0;
    align-items: stretch;
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
  overflow: hidden;
  display: flex;
  justify-content: center;

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
