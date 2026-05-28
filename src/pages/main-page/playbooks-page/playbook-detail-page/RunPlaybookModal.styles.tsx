import styled from "styled-components";

export const Description = styled.p`
  font: ${({ theme }) => theme.typography.body.font};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
`;

export {
  VariableInputContainer,
  VariableLabel,
  VariableList,
  VariableName,
  VariableRow,
  VariableType,
} from "@/pages/main-page/monitoring-page/timeline-tab-view/ManualActionModal.styles";
