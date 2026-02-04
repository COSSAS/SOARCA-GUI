import styled from "styled-components";

export const TwoColumnLayout = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 40% 60%;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 1200px) {
    padding-right: 0;
  }
`;
