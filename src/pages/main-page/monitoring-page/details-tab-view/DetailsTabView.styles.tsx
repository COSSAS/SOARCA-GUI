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
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const VariableItemRow = styled.div`
  width: 100%;
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.background.secondary};
  align-items: center;
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
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.body.font};
`;
