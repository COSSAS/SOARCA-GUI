import styled from "styled-components";

export const DetailsGrid = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const DetailsItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: flex-start;
`;

export const CapabilityCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing.md};

  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};
`;

export const CapabilityHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const StepExamplesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

export const CodeBlock = styled.pre`
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: ${({ theme }) => theme.spacing.md};

  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.code_small.font};

  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;
