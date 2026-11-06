import styled from "styled-components";

export const MethodSelector = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const MethodButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
  justify-content: center;

  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.info.border : theme.colors.border.light};
  border-radius: ${({ theme }) => theme.radius.md};

  font: ${({ theme }) => theme.typography.bodyMedium.font};
  color: ${({ theme }) => theme.colors.text.primary};

  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.info.bg : theme.colors.background.primary};

  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.info.border};
    background-color: ${({ theme }) => theme.colors.info.bg};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: ${({ theme }) => theme.interactions.disabledOpacity};
  }
`;
