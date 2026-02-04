import styled from "styled-components";

export const PlaybookListItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing["2xl"]};
  padding-left: ${({ theme }) => theme.spacing.lg};
  padding-right: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.radius.lg};
  background-color: ${({ theme }) => theme.colors.background.primary};
  border: 2px solid ${({ theme }) => theme.colors.palette.primary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    background-color: ${({ theme }) => theme.colors.info.bg};
    border-color: ${({ theme }) => theme.colors.info.border};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const PlaybookInfo = styled.div`
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  margin-right: ${({ theme }) => theme.spacing.lg};

  gap: ${({ theme }) => theme.spacing.xs};
`;

export const PlaybookName = styled.h4`
  margin: 0;
  font: ${({ theme }) => theme.typography.h4.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const PlaybookDescription = styled.p`
  margin: 0;
  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.secondary};
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-wrap: break-word;
  text-overflow: ellipsis;
`;

export const TimelineContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  position: relative;
  min-height: 80px;
`;

export const TimelineLine = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background-color: ${({ theme }) => theme.colors.palette.primary};
  transform: translateY(-50%);
`;

export const TimelineSteps = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 1;
`;

export const TimelineStep = styled.div<{ $position: "top" | "bottom" }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  position: relative;
`;

export const TimelineDot = styled.div<{ $type: string }>`
  width: 12px;
  height: 12px;
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
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const TimelineLabel = styled.span<{ $position: "top" | "bottom" }>`
  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  max-width: 125px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: absolute;
  ${({ $position }) =>
    $position === "top"
      ? `
    bottom: calc(100% + 4px);
  `
      : `
    top: calc(100% + 4px);
  `}
`;

export const PlaybookActions = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  padding-left: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    color: ${({ theme }) => theme.colors.info.border};
  }
`;

export const PlaybookList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;
