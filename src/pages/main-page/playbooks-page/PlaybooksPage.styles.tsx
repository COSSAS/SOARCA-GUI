import styled from "styled-components";

export const PlaybookListItem = styled.div`
  position: relative;

  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing["2xl"]};

  padding-left: ${({ theme }) => theme.spacing.lg};
  padding-right: ${({ theme }) => theme.spacing.lg};

  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => `0 ${theme.radius.sm} ${theme.radius.sm} 0`};
  background-color: ${({ theme }) => theme.colors.background.primary};

  &::before {
    content: "";
    position: absolute;
    top: -1px;
    bottom: -1px;
    left: -1px;

    width: 4px;

    background-color: ${({ theme }) => theme.colors.palette.primary};
  }

  cursor: pointer;
  transition:
    background-color ${({ theme }) => theme.transitions.base},
    border-color ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.info.border};
    background-color: ${({ theme }) => theme.colors.info.bg};
  }
`;

export const PlaybookInfo = styled.div`
  display: flex;
  flex: 0 0 300px;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  margin-right: ${({ theme }) => theme.spacing.lg};
`;

export const PlaybookName = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font: ${({ theme }) => theme.typography.h3.font};
`;

export const PlaybookDescription = styled.p`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;

  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.caption.font};
  text-overflow: ellipsis;
  word-wrap: break-word;
`;

export const TimelineContainer = styled.div`
  position: relative;

  display: flex;
  flex: 1;
  align-items: center;

  min-height: 80px;
`;

export const TimelineLine = styled.div`
  position: absolute;
  top: 50%;
  right: 0;
  left: 0;
  transform: translateY(-50%);

  height: 2px;

  background-color: ${({ theme }) => theme.colors.palette.primary};
`;

export const TimelineSteps = styled.div`
  position: relative;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
`;

export const TimelineStep = styled.div<{ $position: "top" | "bottom" }>`
  position: relative;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const TimelineDot = styled.div<{ $type: string }>`
  width: 16px;
  height: 16px;

  border: 2px solid ${({ theme }) => theme.colors.background.primary};
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ theme, $type }) => {
    switch ($type) {
      case "if-condition":
        return theme.colors.success.solidBg;
      case "parallel":
        return theme.colors.accent.solidBg;
      case "action":
        return theme.colors.warning.solidBg;
      default:
        return theme.colors.info.solidBg;
    }
  }};
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

export const TimelineLabel = styled.span<{ $position: "top" | "bottom" }>`
  position: absolute;
  ${({ $position }) =>
    $position === "top"
      ? `
    bottom: calc(100% + 4px);
  `
      : `
    top: calc(100% + 4px);
  `}

  overflow: hidden;

  max-width: 125px;

  color: ${({ theme }) => theme.colors.text.secondary};
  font: ${({ theme }) => theme.typography.caption.font};
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PlaybookActions = styled.div`
  display: flex;
  flex: 0 0 auto;
  align-items: center;

  padding-left: ${({ theme }) => theme.spacing.md};
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  max-width: 400px;
`;

export const PlaybookList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;
