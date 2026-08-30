import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";

import { triggerPlaybookById } from "@/api/trigger";
import { formatErrorForToast } from "@/api/utils";
import { Button, Modal, ThemeVariant } from "@/components";
import { VariableInput } from "@/pages/main-page/monitoring-page/timeline-tab-view/VariableInputs";
import { RunStarted, Playbook, Variables } from "@/types";

import {
  Description,
  VariableInputContainer,
  VariableLabel,
  VariableList,
  VariableName,
  VariableRow,
  VariableType,
} from "./RunPlaybookModal.styles";

interface RunPlaybookModalProps {
  playbook: Playbook;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (execution: RunStarted) => void;
}

export const RunPlaybookModal: React.FC<RunPlaybookModalProps> = ({
  playbook,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const externalVars = Object.entries(playbook.playbook_variables ?? {}).filter(
    ([, v]) => v.external === true,
  );

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(externalVars.map(([key, v]) => [key, v.value ?? ""])),
  );

  const mutation = useMutation({
    mutationFn: (variables: Variables | undefined) =>
      triggerPlaybookById(playbook.id, variables),
    onSuccess: (data: RunStarted) => {
      toast.success("Playbook started");
      onSuccess(data);
      onClose();
    },
    onError: (err: Error) => {
      toast.error(formatErrorForToast(err, "Failed to trigger playbook"));
    },
  });

  const handleValueChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleRunWithVariables = () => {
    const vars: Variables = {};
    externalVars.forEach(([key, variable]) => {
      vars[key] = {
        type: variable.type,
        value: values[key] ?? "",
      };
    });
    mutation.mutate(vars);
  };

  const handleRunWithoutVariables = () => {
    mutation.mutate(undefined);
  };

  return (
    <Modal $isOpen={isOpen} $onClose={() => !mutation.isPending && onClose()}>
      <Modal.Header>
        Run playbook
        <Modal.CloseButton
          onClick={() => !mutation.isPending && onClose()}
          disabled={mutation.isPending}
        />
      </Modal.Header>
      <Modal.Body>
        <Description>
          This playbook accepts external variables. Provide values below or run
          without setting any.
        </Description>
        <VariableList>
          {externalVars.map(([key, variable]) => (
            <VariableRow key={key}>
              <VariableLabel>
                <VariableName>{variable.name ?? key}</VariableName>
                <VariableType>{variable.type}</VariableType>
              </VariableLabel>
              <VariableInputContainer>
                <VariableInput
                  variableKey={key}
                  type={variable.type}
                  value={values[key] ?? ""}
                  disabled={mutation.isPending}
                  onChange={handleValueChange}
                />
              </VariableInputContainer>
            </VariableRow>
          ))}
        </VariableList>
      </Modal.Body>
      <Modal.Footer>
        <Button
          $variant={ThemeVariant.Primary}
          $ghost
          onClick={handleRunWithoutVariables}
          disabled={mutation.isPending}
        >
          Run without variables
        </Button>
        <Button
          $variant={ThemeVariant.Success}
          onClick={handleRunWithVariables}
          disabled={mutation.isPending}
        >
          Run with variables
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
