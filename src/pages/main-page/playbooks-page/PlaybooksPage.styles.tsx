import styled from "styled-components";

export const PlaybookListItem = styled.div`
  cursor: pointer;

  position: relative;

  display: flex;
  gap: ${({ theme }) => theme.spacing["2xl"]};
  align-items: center;

  padding-right: ${({ theme }) => theme.spacing.lg};
  padding-left: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.border.medium};
  border-radius: ${({ theme }) => `0 ${theme.radius.sm} ${theme.radius.sm} 0`};

  background-color: ${({ theme }) => theme.colors.background.primary};

  transition:
    background-color ${({ theme }) => theme.transitions.base},
    border-color ${({ theme }) => theme.transitions.base};

  &::before {
    content: "";

    position: absolute;
    top: -1px;
    bottom: -1px;
    left: -1px;

    width: 4px;

    background-color: ${({ theme }) => theme.colors.palette.primary};
  }

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
  font: ${({ theme }) => theme.typography.h3.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const PlaybookDescription = styled.p`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;

  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.secondary};
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
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;
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

  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.secondary};
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
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;

  width: 100%;
  max-width: 400px;
`;

export const PlaybookList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;
