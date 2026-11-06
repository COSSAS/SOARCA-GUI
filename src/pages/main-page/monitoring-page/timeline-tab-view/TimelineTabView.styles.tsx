import { fadeInSlide } from "@/theme/animations";
import styled from "styled-components";

export const TimelineContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const TimelineRow = styled.div<{ $delay?: number }>`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;

  opacity: 0;

  animation: ${fadeInSlide} 0.4s ease-out forwards;
  animation-delay: ${({ $delay = 0 }) => $delay}s;
`;

export const TimelineCenterLine = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);

  width: 2px;

  background: ${({ theme }) => theme.colors.border.medium};
`;

export const TimelineIconContainer = styled.div`
  position: relative;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TimelineLeftCell = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-end;
`;

export const TimelineRightCell = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
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
  box-shadow: none;
`;

export const UserReplyItem = styled.div`
  position: relative;
  width: fit-content;
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
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;

  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme }) => theme.colors.success.text};
`;

export const TimelineHeader = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  justify-content: space-between;
`;

export const TimelineTitle = styled.h3`
  font: ${({ theme }) => theme.typography.h3.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const TimelineMetaBadge = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

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
