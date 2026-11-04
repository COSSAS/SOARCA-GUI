import styled from "styled-components";

import type { StepColor } from "../model/specs";
import { getStepColors } from "./colors";

// Matches the look of a step on the canvas: type-coloured top border, square corners.
export const DetailsCard = styled.aside<{ $color: StepColor }>`
  position: absolute;
  z-index: 5;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};

  display: flex;
  flex-direction: column;

  width: min(24rem, calc(100% - 2rem));
  max-height: calc(100% - 2rem);
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-top: ${({ theme, $color }) =>
    `${theme.spacing.xs} solid ${getStepColors(theme, $color).solidBg}`};

  background: ${({ theme }) => theme.colors.background.primary};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

export const DetailsHeader = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: flex-start;

  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

export const DetailsHeading = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  min-width: 0;
`;

export const DetailsType = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;

  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const DetailsTitle = styled.h3`
  margin: 0;
  font: ${({ theme }) => theme.typography.h3.font};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow-wrap: anywhere;
`;

export const DetailsBody = styled.dl`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  margin: 0;
  padding: ${({ theme }) => theme.spacing.md};
`;

export const DetailsField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

export const DetailsLabel = styled.dt`
  font: ${({ theme }) => theme.typography.small.font};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const DetailsValue = styled.dd`
  margin: 0;
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow-wrap: anywhere;
`;

export const DetailsCode = styled.pre`
  overflow-x: auto;

  margin: 0;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border.light};

  font: ${({ theme }) => theme.typography.code.font};
  color: ${({ theme }) => theme.colors.text.secondary};

  background: ${({ theme }) => theme.colors.background.tertiary};
`;

export const DetailsEmpty = styled.p`
  margin: 0;
  font: ${({ theme }) => theme.typography.caption.font};
  color: ${({ theme }) => theme.colors.text.secondary};
`;
