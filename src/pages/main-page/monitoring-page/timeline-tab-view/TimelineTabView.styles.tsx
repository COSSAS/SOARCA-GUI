import { fadeInSlide } from "@/theme/animations";
import styled from "styled-components";

export const TimelineContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: 0;
`;

export const TimelineRow = styled.div<{ $delay?: number }>`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;
  animation: ${fadeInSlide} 0.4s ease-out forwards;
  animation-delay: ${({ $delay = 0 }) => $delay}s;
  opacity: 0;
`;

export const TimelineCenterLine = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: ${({ theme }) => theme.colors.border.medium};
  transform: translateX(-50%);
`;

export const TimelineIconContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

export const SpinnerIconContainer = styled.div<{
  $variant: "primary" | "warning";
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background-color: ${({ theme, $variant }) =>
    $variant === "warning"
      ? theme.colors.warning.solidBg
      : theme.colors.primary.main};
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === "warning"
        ? theme.colors.warning.border
        : theme.colors.primary.main};
`;

export const TimelineLeftCell = styled.div`
  display: flex;
  justify-content: flex-end;
  position: relative;
`;

export const TimelineRightCell = styled.div`
  display: flex;
  justify-content: flex-start;
  position: relative;
`;

export const TimelineSpacer = styled.div``;

export const TimelineItemWrapper = styled.div<{ $side: "left" | "right" }>`
  position: relative;
  width: fit-content;
  max-width: 100%;
`;

export const TimelineItem = styled.div`
  position: relative;
  width: fit-content;
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
`;

export const UserReplyItem = styled.div`
  position: relative;
  width: fit-content;
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
`;

export const ResponseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

export const ResponseItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme }) => theme.colors.success.text};
`;

export const TimelineHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: 0;
  border: none;
  background: transparent;
`;

export const TimelineTitle = styled.h3`
  margin: 0;
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

export const TimelineMetaBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 0;
  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const UserPendingActionItem = styled.div`
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    transform: translateY(-2px);
  }
`;
