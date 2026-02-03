import { fadeInSlide } from "@/theme/animations";
import styled from "styled-components";

export const TimelineVertical = styled.div`
  position: relative;
  padding: ${({ theme }) => theme.spacing.lg} 0;
`;

export const TimelineRow = styled.div<{ $delay?: number }>`
  display: block;
  animation: ${fadeInSlide} 0.28s ease-out forwards;
  animation-delay: ${({ $delay = 0 }) => $delay}s;
  opacity: 0;
`;

export const TimelineVerticalLine = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: ${({ theme }) => theme.colors.palette.primary};
  transform: translateX(-50%);
`;

export const TimelineStepCard = styled.div<{ $align: "left" | "right" }>`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: ${({ $align }) =>
    $align === "left" ? "flex-start" : "flex-end"};
`;

export const StepCardWrapper = styled.div<{ $align: "left" | "right" }>`
  width: 45%;
  position: relative;

  /* Connector line from card to center timeline */
  &::before {
    content: "";
    position: absolute;
    top: 24px;
    ${({ $align }) => ($align === "left" ? "right: -20px" : "left: -20px")};
    width: 20px;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.palette.primary};
  }
`;

export const TimelineDotCenter = styled.div<{ $type: string }>`
  position: absolute;
  left: 50%;
  top: 24px;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: ${({ theme }) => theme.radius.full};
  background-color: ${({ theme, $type }) => {
    switch ($type) {
      case "start":
        return theme.colors.success.solidBg;
      case "end":
        return theme.colors.error.solidBg;
      case "if-condition":
        return theme.colors.palette.background;
      case "parallel":
        return theme.colors.palette.accent;
      case "action":
        return theme.colors.warning.solidBg;
      default:
        return theme.colors.info.solidBg;
    }
  }};
  border: 3px solid ${({ theme }) => theme.colors.background.primary};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 2;
`;

export const StepCard = styled.div`
  border-radius: ${({ theme }) => theme.radius.md};
  background-color: ${({ theme }) => theme.colors.background.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary.border};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.hover};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const StepCardHeader = styled.div<{ $expanded: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ theme, $expanded }) =>
    $expanded ? theme.colors.info.bg : theme.colors.background.primary};
  transition: all ${({ theme }) => theme.transitions.base};

  &:hover {
    background-color: ${({ theme }) => theme.colors.info.bg};
  }
`;

export const StepCardTitle = styled.h5`
  margin: 0;
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const StepCardBody = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background.primary};
`;
