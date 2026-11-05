import styled from "styled-components";

export const DetailsGrid = styled.div`
  width: 100%;
  display: grid;
  /* minmax(0, ...) stops long unbreakable values (IDs, commands) from
     widening a track and pushing content out of the grid */
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-content: start;
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
  min-width: 0;
  overflow-wrap: anywhere;
`;

export const DetailsValue = styled.div`
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;
