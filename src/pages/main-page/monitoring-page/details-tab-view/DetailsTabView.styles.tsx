import styled from "styled-components";

export const DetailedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const DetailedItemSummary = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  margin-top: ${({ theme }) => theme.spacing.sm};

  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const VariableListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
`;

export const VariableItemRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;

  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};

  background: ${({ theme }) => theme.colors.background.secondary};
`;

export const VariableCellValue = styled.div`
  width: 100%;
  min-width: 0;

  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
  word-break: break-word;
`;

export const Placeholder = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;
