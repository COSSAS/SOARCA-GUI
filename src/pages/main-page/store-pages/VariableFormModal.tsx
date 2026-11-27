import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import toast from "react-hot-toast";

import {
  createVariable,
  updateVariableDescription,
  updateVariableValue,
} from "@/api/store";
import { storeQueries } from "@/api/storeQueries";
import { formatErrorForToast } from "@/api/utils";
import {
  Button,
  FormGroup,
  FormLabel,
  Input,
  Modal,
  Select,
  Text,
  ThemeVariant,
  VariableInput,
} from "@/components";
import { VARIABLE_TYPES } from "@/pages/main-page/playbooks-page/visual-editor/model/specs/cacao-2.0";
import type { StoredVariable } from "@/types";

import { NAME_PATTERN } from "./utils";

interface VariableFormModalProps {
  /** The variable to edit. Leave out to create one. */
  variable?: StoredVariable;
  onClose: () => void;
}

export const VariableFormModal: React.FC<VariableFormModalProps> = ({
  variable,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState(variable?.name ?? "");
  const [type, setType] = useState(variable?.type ?? "string");
  const [value, setValue] = useState(variable?.value ?? "");
  const [description, setDescription] = useState(variable?.description ?? "");

  const nameError =
    !variable && name && !NAME_PATTERN.test(name)
      ? "Use lowercase letters, digits, '_', '.' or '-', starting with a letter or digit."
      : undefined;

  const descriptionSaved = useRef(false);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!variable) return createVariable({ name, type, value, description });
      descriptionSaved.current = false;
      // A new description keeps the version, so it is saved first. If the new
      // value then fails, a retry still sends the version the user edited.
      if (description !== variable.description) {
        await updateVariableDescription(variable.name, description);
        descriptionSaved.current = true;
      }
      if (value !== variable.value)
        await updateVariableValue(variable.name, variable.version, value);
    },
    onSuccess: () => {
      toast.success(variable ? "Variable saved" : "Variable created");
      onClose();
    },
    onError: (err: Error) => {
      const message = formatErrorForToast(err, "Could not save the variable");
      toast.error(
        descriptionSaved.current
          ? `The description was saved, but the value was not. ${message}`
          : message,
      );
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: storeQueries.variables().queryKey,
        }),
        variable &&
          queryClient.invalidateQueries({
            queryKey: storeQueries.variableVersions(variable.name).queryKey,
          }),
      ]),
  });

  const unchanged =
    !!variable &&
    value === variable.value &&
    description === variable.description;
  const close = () => !mutation.isPending && onClose();

  return (
    <Modal
      $isOpen
      $onClose={close}
      aria-label={variable ? "Edit variable" : "New variable"}
    >
      <Modal.Header>
        <Modal.Title>
          {variable ? `Edit ${variable.name}` : "New variable"}
        </Modal.Title>
        <Modal.CloseButton onClick={close} disabled={mutation.isPending} />
      </Modal.Header>
      <Modal.Body>
        <FormGroup>
          <FormLabel htmlFor="variable-name">Name</FormLabel>
          <Input
            id="variable-name"
            value={name}
            disabled={!!variable || mutation.isPending}
            placeholder="fw-api-user"
            onChange={(e) => setName(e.target.value)}
          />
          {nameError && <Text>{nameError}</Text>}
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="variable-type">Type</FormLabel>
          <Select
            id="variable-type"
            $value={type}
            $onChange={(next) => {
              setType(next);
              setValue("");
            }}
            disabled={!!variable || mutation.isPending}
            title={variable ? "The type cannot change" : undefined}
            $options={VARIABLE_TYPES.map((t) => ({ value: t, label: t }))}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="variable-value">Value</FormLabel>
          <VariableInput
            id="variable-value"
            variableKey="value"
            type={type}
            value={value}
            disabled={mutation.isPending}
            onChange={(_, next) => setValue(next)}
          />
        </FormGroup>
        <FormGroup>
          <FormLabel htmlFor="variable-description">Description</FormLabel>
          <Input
            id="variable-description"
            value={description}
            disabled={mutation.isPending}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button
          $variant={ThemeVariant.Primary}
          $ghost
          onClick={close}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button
          $variant={ThemeVariant.Primary}
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || unchanged || !name || !!nameError}
        >
          {variable ? "Save" : "Create"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
