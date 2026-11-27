import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import toast from "react-hot-toast";

import { storeQueries } from "@/api/storeQueries";
import { triggerPlaybookById } from "@/api/trigger";
import { formatErrorForToast, getErrorFromApiResponse } from "@/api/utils";
import { useAuth } from "@/auth/AuthContext";
import { Permissions } from "@/auth/permissions";
import {
  Button,
  Modal,
  NotificationCard,
  Spinner,
  Text,
  ThemeSize,
  ThemeVariant,
  VariableInput,
} from "@/components";
import {
  ReferenceStatusBadge,
  STATUS_LABELS,
} from "@/pages/main-page/store-pages/ReferenceStatusBadge";
import { sourceLabel } from "@/pages/main-page/store-pages/utils";
import type { Execution, Playbook, PlaybookResolve, Variables } from "@/types";

import {
  Description,
  VariableInputContainer,
  VariableLabel,
  VariableList,
  VariableName,
  VariableRow,
  VariableType,
} from "./RunPlaybookModal.styles";

/**
 * Why SOARCA would refuse to start the playbook, or undefined when it can
 * start. The trigger accepts values for external variables that the mapping
 * does not fill, so those alone do not block a run: the form asks for them.
 */
const notReadyReason = (
  resolve: PlaybookResolve,
  externals: Set<string>,
): string | undefined => {
  if (resolve.ready) return undefined;
  if (resolve.variables.some((v) => v.status !== "ok"))
    return "Some mapped variables cannot be read. Fix them in the Mapping tab of the playbook before running it.";
  const objects = [
    ...(resolve.authentication_info ?? []),
    ...(resolve.targets ?? []),
  ];
  const objectsOk = objects.every(
    (o) => o.status === "ok" && o.fields.every((f) => f.status === "ok"),
  );
  const unfilled = resolve.unmapped.filter((ref) => !externals.has(ref));
  if (objectsOk && unfilled.length === 0 && resolve.unmapped.length > 0)
    return undefined;
  return `SOARCA reports that this playbook is not ready to run${
    unfilled.length ? `. Nothing fills: ${unfilled.join(", ")}` : ""
  }.`;
};

interface RunPlaybookModalProps {
  playbook: Playbook;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (execution: Execution) => void;
}

export const RunPlaybookModal: React.FC<RunPlaybookModalProps> = ({
  playbook,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { can } = useAuth();
  // Without mapping:read the GUI cannot see which variables SOARCA fills, so
  // it asks for all of them. SOARCA names any mapped one it rejects.
  const canReadMapping = can(Permissions.MappingRead);
  const resolve = useQuery({
    ...storeQueries.resolve(playbook.id),
    enabled: canReadMapping,
  });
  const checking = canReadMapping && resolve.isLoading;
  const resolveFailed = canReadMapping && resolve.isError;
  const mapped = new Map(resolve.data?.variables.map((v) => [v.ref, v]));

  const externalVars = Object.entries(playbook.playbook_variables ?? {}).filter(
    ([, v]) => v.external === true,
  );
  const notReady =
    resolve.data &&
    notReadyReason(resolve.data, new Set(externalVars.map(([key]) => key)));
  // SOARCA fills mapped variables itself and rejects a run that sends them.
  const askedVars = externalVars.filter(([key]) => !mapped.has(key));

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(externalVars.map(([key, v]) => [key, v.value ?? ""])),
  );

  const mutation = useMutation({
    mutationFn: (variables: Variables | undefined) =>
      triggerPlaybookById(playbook.id, variables),
    onSuccess: (data: Execution) => {
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
    mutation.mutate(
      Object.fromEntries(
        askedVars.map(([key, variable]) => [
          key,
          { type: variable.type, value: values[key] ?? "" },
        ]),
      ),
    );
  };

  const handleRunWithoutVariables = () => {
    mutation.mutate(undefined);
  };

  return (
    <Modal
      $isOpen={isOpen}
      $onClose={() => !mutation.isPending && onClose()}
      aria-label="Run playbook"
    >
      <Modal.Header>
        <Modal.Title>Run playbook</Modal.Title>
        <Modal.CloseButton
          onClick={() => !mutation.isPending && onClose()}
          disabled={mutation.isPending}
        />
      </Modal.Header>
      <Modal.Body>
        {notReady && (
          <NotificationCard $variant={ThemeVariant.Warning}>
            <Text>{notReady}</Text>
          </NotificationCard>
        )}
        {resolveFailed && (
          <NotificationCard $variant={ThemeVariant.Error}>
            <Text>
              Could not check which variables come from the playbook mapping
              {`: ${getErrorFromApiResponse(resolve.error).message || "unknown error"}`}
              . You can still run without variables.
            </Text>
            <Button
              $size={ThemeSize.Small}
              $ghost
              onClick={() => void resolve.refetch()}
            >
              Try again
            </Button>
          </NotificationCard>
        )}
        {checking ? (
          <Spinner />
        ) : (
          <Description>
            {askedVars.length > 0
              ? "This playbook accepts external variables. Provide values below or run without setting any."
              : "All external variables of this playbook come from stored secrets and variables."}
          </Description>
        )}
        <VariableList hidden={checking}>
          {externalVars.map(([key, variable]) => {
            const source = mapped.get(key);
            return (
              <VariableRow key={key}>
                <VariableLabel>
                  <VariableName>{variable.name ?? key}</VariableName>
                  <VariableType>{variable.type}</VariableType>
                </VariableLabel>
                <VariableInputContainer>
                  {source ? (
                    <ReferenceStatusBadge status={source.status}>
                      From {sourceLabel(source.source)}
                      {source.status !== "ok" &&
                        `: ${STATUS_LABELS[source.status]}`}
                    </ReferenceStatusBadge>
                  ) : (
                    <VariableInput
                      variableKey={key}
                      type={variable.type}
                      value={values[key] ?? ""}
                      disabled={mutation.isPending}
                      onChange={handleValueChange}
                    />
                  )}
                </VariableInputContainer>
              </VariableRow>
            );
          })}
        </VariableList>
      </Modal.Body>
      <Modal.Footer>
        <Button
          $variant={ThemeVariant.Primary}
          $ghost
          onClick={handleRunWithoutVariables}
          disabled={mutation.isPending || checking || !!notReady}
        >
          Run without variables
        </Button>
        <Button
          $variant={ThemeVariant.Success}
          onClick={handleRunWithVariables}
          disabled={
            mutation.isPending || checking || resolveFailed || !!notReady
          }
        >
          Run with variables
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
