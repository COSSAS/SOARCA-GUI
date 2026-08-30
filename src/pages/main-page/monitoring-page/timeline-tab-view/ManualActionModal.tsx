import {
  QueryObserverResult,
  useMutation,
  UseMutationResult,
  useQuery,
} from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";

import { getStepManualData, putStepActionResult } from "@/api/manual";
import { formatErrorForToast } from "@/api/utils";
import { Button, Modal, RadioGroup, Spinner, ThemeVariant } from "@/components";
import {
  RunStarted,
  ManualOutArgsUpdatePayload,
  ManualResponseStatus,
  PlaybookRunReport,
  StepRunReport,
  Variables,
} from "@/types";
import {
  CommandText,
  InfoIcon,
  InfoIconWrapper,
  Section,
  SectionTitle,
  StepDescription,
  StepName,
  StepSummary,
  VariableInputContainer,
  VariableLabel,
  VariableList,
  VariableName,
  VariableRow,
  VariableType,
} from "./ManualActionModal.styles";
import { VariableInput } from "./VariableInputs";

interface ManualActionModalProps {
  activeStep: StepRunReport | null;
  playbookId?: string;
  executionId?: string;
  onClose: () => void;
  onSuccess?: () => Promise<
    QueryObserverResult<PlaybookRunReport, unknown>
  >;
}

const enum ActionType {
  CONFIRM = "confirm",
  REJECT = "reject",
}

const decodeCommand = (commandB64: string): string => {
  try {
    return atob(commandB64);
  } catch {
    return commandB64;
  }
};

export const ManualActionModal: React.FC<ManualActionModalProps> = ({
  activeStep,
  playbookId,
  executionId,
  onClose,
  onSuccess,
}) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {},
  );
  const [variableChoices, setVariableChoices] = useState<
    Record<string, ActionType>
  >({});

  const { data: interactionData, isLoading: isLoadingOutArgs } = useQuery({
    queryKey: ["manual", executionId, activeStep?.step_run_id],
    queryFn: () => getStepManualData(executionId!, activeStep!.step_run_id),
    enabled: !!activeStep && !!executionId,
  });

  const mutation = useMutation({
    mutationFn: (payload: ManualOutArgsUpdatePayload) =>
      putStepActionResult(executionId!, activeStep!.step_run_id, payload),
    onSuccess: async () => {
      toast.success("Action submitted");
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    },
    onError: (err: Error) => {
      toast.error(
        formatErrorForToast(err, "Failed to submit action. Please try again."),
      );
    },
  });

  const handleChoiceChange = (key: string, value: ActionType) => {
    setVariableChoices((prev) => ({ ...prev, [key]: value }));
  };

  const handleValueChange = (key: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (action: ActionType) => {
    if (!activeStep || !playbookId || !executionId) return;

    const response_out_args: Variables = {};
    const outArgs = interactionData?.out_args ?? {};

    Object.entries(outArgs).forEach(([key, variable]) => {
      const hasExistingValue = variable?.value && variable.value.trim() !== "";

      if (hasExistingValue) {
        response_out_args[key] = {
          ...variable,
          name: variable?.name || key,
          type: variable?.type || "string",
          value: variable.value,
        };
      } else {
        response_out_args[key] = {
          ...variable,
          name: variable?.name || key,
          type: variable?.type || "string",
          value: variableValues[key] || "",
        };
      }
    });

    const responseStatus: ManualResponseStatus =
      action === ActionType.CONFIRM ? "success" : "failure";

    const payload: ManualOutArgsUpdatePayload = {
      type: "manual-command-info",
      response_status: responseStatus,
      response_out_args,
    };

    mutation.mutate(payload);
  };

  return (
    <Modal
      $isOpen={!!activeStep}
      $onClose={() => (!mutation.isPending ? onClose() : null)}
    >
      <Modal.Header>
        Manual action required
        <Modal.CloseButton onClick={onClose} />
      </Modal.Header>
      <Modal.Body>
        <ModalContent
          activeStep={activeStep}
          outArgs={interactionData?.out_args ?? {}}
          isLoadingOutArgs={isLoadingOutArgs}
          mutation={mutation}
          variableValues={variableValues}
          variableChoices={variableChoices}
          onChoiceChange={handleChoiceChange}
          onValueChange={handleValueChange}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          $variant={ThemeVariant.Primary}
          $ghost
          title="Close the modal without taking any action"
          onClick={() => (!mutation.isPending ? onClose() : null)}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button
          $variant={ThemeVariant.Error}
          title="Reject the action and notify the playbook"
          onClick={() => handleSubmit(ActionType.REJECT)}
          disabled={mutation.isPending || isLoadingOutArgs}
        >
          Reject
        </Button>
        <Button
          $variant={ThemeVariant.Success}
          title="Confirm the action and submit the variables, if requested"
          onClick={() => handleSubmit(ActionType.CONFIRM)}
          disabled={mutation.isPending || isLoadingOutArgs}
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

interface ModalContentProps {
  activeStep: StepRunReport | null;
  outArgs: Variables;
  isLoadingOutArgs: boolean;
  mutation: UseMutationResult<
    RunStarted,
    Error,
    ManualOutArgsUpdatePayload,
    unknown
  >;
  variableValues: Record<string, string>;
  variableChoices: Record<string, ActionType>;
  onChoiceChange: (key: string, value: ActionType) => void;
  onValueChange: (key: string, value: string) => void;
}

const ModalContent: React.FC<ModalContentProps> = ({
  activeStep,
  outArgs,
  isLoadingOutArgs,
  mutation,
  variableValues,
  variableChoices,
  onChoiceChange,
  onValueChange,
}) => {
  const outArgEntries = Object.entries(outArgs);
  const commandTexts =
    activeStep?.commands_b64?.map((cmd) => decodeCommand(cmd)) || [];

  return (
    <>
      <StepSummary>
        <StepName>{activeStep?.name || "Unnamed step"}</StepName>
        {activeStep?.description && (
          <StepDescription>{activeStep.description}</StepDescription>
        )}
      </StepSummary>

      {commandTexts.length > 0 && (
        <Section>
          <SectionTitle>Action to perform</SectionTitle>
          {commandTexts.map((cmdText, idx) => (
            <CommandText key={idx}>{cmdText}</CommandText>
          ))}
        </Section>
      )}

      {isLoadingOutArgs ? (
        <Section>
          <Spinner />
        </Section>
      ) : outArgEntries.length > 0 ? (
        <Section>
          <SectionTitle>Variables</SectionTitle>
          <VariableList>
            {outArgEntries.map(([key, variable]) => {
              const hasExistingValue =
                variable?.value && variable.value.trim() !== "";
              const varType = variable?.type || "string";

              return (
                <VariableRow key={key}>
                  <VariableLabel>
                    <VariableName>{variable?.name || key}</VariableName>
                    <VariableType>({varType})</VariableType>
                    {variable?.description && (
                      <InfoIconWrapper title={variable.description}>
                        <InfoIcon />
                      </InfoIconWrapper>
                    )}
                  </VariableLabel>
                  {hasExistingValue ? (
                    <RadioGroup
                      name={`var-${key}`}
                      $options={[
                        { label: "Confirm", value: ActionType.CONFIRM },
                        { label: "Reject", value: ActionType.REJECT },
                      ]}
                      $value={variableChoices[key] || ActionType.CONFIRM}
                      $onChange={(value) =>
                        onChoiceChange(key, value as ActionType)
                      }
                      $disabled={mutation.isPending}
                    />
                  ) : (
                    <VariableInputContainer>
                      <VariableInput
                        variableKey={key}
                        type={varType}
                        value={variableValues[key] || ""}
                        disabled={mutation.isPending}
                        onChange={onValueChange}
                      />
                    </VariableInputContainer>
                  )}
                </VariableRow>
              );
            })}
          </VariableList>
        </Section>
      ) : (
        <Section>
          <SectionTitle>No variables available</SectionTitle>
          <p>This action does not require any variable inputs.</p>
        </Section>
      )}
    </>
  );
};
