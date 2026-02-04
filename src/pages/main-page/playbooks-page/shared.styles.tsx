import styled from "styled-components";

// Shared layout components
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

// JSON Editor components
export const EditorContainer = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const EditorTextarea = styled.textarea<{ $hasError: boolean }>`
  width: 100%;
  box-sizing: border-box;
  min-height: 500px;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 2px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error.border : theme.colors.border.medium};
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.code_medium.font};
  resize: vertical;
  transition: all ${({ theme }) => theme.transitions.base};

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error.border : theme.colors.info.border};
    background-color: ${({ theme }) => theme.colors.background.primary};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.interactions.disabledOpacity};
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error.text};
  font: ${({ theme }) => theme.typography.body.font};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.error.bg};
  border: 1px solid ${({ theme }) => theme.colors.error.border};
  border-radius: ${({ theme }) => theme.radius.sm};
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
`;

export const EditorHint = styled.p`
  margin: 0 0 ${({ theme }) => theme.spacing.md};
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;
