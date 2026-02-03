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
  cursor: pointer;
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

export const DropZone = styled.div<{
  $isDragActive: boolean;
  $hasError: boolean;
}>`
  border: 2px dashed
    ${({ theme, $isDragActive, $hasError }) =>
      $hasError
        ? theme.colors.error.border
        : $isDragActive
          ? theme.colors.info.border
          : theme.colors.border.medium};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: ${({ theme }) => theme.spacing["3xl"]};
  text-align: center;
  background-color: ${({ theme, $isDragActive }) =>
    $isDragActive ? theme.colors.info.bg : theme.colors.background.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};

  &:hover {
    border-color: ${({ theme }) => theme.colors.info.border};
    background-color: ${({ theme }) => theme.colors.info.bg};
  }
`;

export const DropZoneText = styled.p`
  margin: 0;
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const DropZoneHint = styled.span`
  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const FileName = styled.div`
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;
