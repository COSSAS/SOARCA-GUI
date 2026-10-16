import styled from "styled-components";

export const MethodSelector = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const MethodButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.md};
  border: 2px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.info.border : theme.colors.border.light};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.info.bg : theme.colors.background.primary};
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.info.border};
    background-color: ${({ theme }) => theme.colors.info.bg};
  }

  &:disabled {
    opacity: ${({ theme }) => theme.interactions.disabledOpacity};
    cursor: not-allowed;
  }
`;
