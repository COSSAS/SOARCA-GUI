import { Info } from "lucide-react";
import styled from "styled-components";

import { ModalCloseButton } from "@/components";

export const StyledCloseButton = styled(ModalCloseButton)`
  color: #ffffff;
  opacity: 0.9;
  font-size: 24px;
  font-weight: bold;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

export const StepSummary = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const StepName = styled.h3`
  font: ${({ theme }) => theme.typography.h3.font};
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

export const StepDescription = styled.p`
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

export const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const SectionTitle = styled.h4`
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

export const CommandText = styled.div`
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.tertiary};
  border-left: 3px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.radius.sm};
`;

export const VariableList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const VariableRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
`;

export const VariableLabel = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 180px;
  flex-shrink: 0;
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const VariableName = styled.span`
  font-weight: 600;
`;

export const VariableType = styled.span`
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-style: italic;
`;

export const InfoIcon = styled(Info)`
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  cursor: help;
  flex-shrink: 0;
`;

export const InfoIconWrapper = styled.div`
  display: inline-flex;
  cursor: help;
`;

export const VariableInputContainer = styled.div`
  flex: 1;
  display: flex;
`;
