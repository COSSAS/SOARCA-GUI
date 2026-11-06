import { IconInfoCircle } from "@tabler/icons-react";
import styled from "styled-components";

export const StepSummary = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const StepName = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
  font: ${({ theme }) => theme.typography.h3.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const StepDescription = styled.p`
  font: ${({ theme }) => theme.typography.body.font};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const SectionTitle = styled.h4`
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  font: ${({ theme }) => theme.typography.h4.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const CommandText = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  border-left: 3px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.radius.sm};

  font: ${({ theme }) => theme.typography.body.font};
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.primary};
  word-break: break-word;
  white-space: pre-wrap;

  background: ${({ theme }) => theme.colors.background.tertiary};
`;

export const VariableList = styled.div`
  display: grid;
  grid-template-columns: max-content 1fr;
  row-gap: ${({ theme }) => theme.spacing.md};
  column-gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;
`;

export const VariableRow = styled.div`
  display: contents;
`;

export const VariableLabel = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing.xs};
  align-items: center;

  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.primary};
`;

export const VariableName = styled.span`
  font-weight: 600;
`;

export const VariableType = styled.span`
  font-style: italic;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const InfoIcon = styled(IconInfoCircle)`
  cursor: help;

  flex-shrink: 0;

  width: 16px;
  height: 16px;

  color: ${({ theme }) => theme.colors.text.tertiary};
`;

export const InfoIconWrapper = styled.div`
  cursor: help;
  display: inline-flex;
`;

export const VariableInputContainer = styled.div`
  min-width: 0;
`;
