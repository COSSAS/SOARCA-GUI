import { useId } from "react";

import {
  FormGroup,
  FormLabel,
  Input,
  SearchSelect,
  type SearchSelectOption,
} from "@/components";
import { VariableInput } from "@/pages/main-page/monitoring-page/timeline-tab-view/VariableInputs";

import type { Field } from "../model/specs";
import { EntryListEditor } from "./EntryListEditor";
import { fromLocalInput, toLocalInput } from "./localTime";
import {
  CheckboxLabel,
  FieldMessage,
  RequiredMark,
  SectionTitle,
  TextArea,
} from "./Panel.styles";
import { usePanelIssue, useReferenceOptions } from "./panelForm";

type FieldInputProps = {
  field: Field;
  value: unknown;
  /** Path from the step or playbook, matching `Issue.field`. */
  path: string;
  /** Receives undefined when the field is cleared. */
  onChange: (value: unknown) => void;
  /** Variable type that picks the input of a `variable-value` field. */
  valueType?: string;
};

type ControlProps = Omit<FieldInputProps, "path"> & {
  id: string;
  text: string;
  invalid: boolean;
};

const textOrUndefined = (text: string) => (text.trim() ? text : undefined);

const toStrings = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String);
  if (value === undefined || value === null || value === "") return [];
  return [String(value)];
};

/**
 * Options of a select field. Ids from `source` that the playbook does not
 * define stay selectable, so opening an imported playbook changes nothing.
 */
const useFieldOptions = (field: Field, selected: string[]): SearchSelectOption[] => {
  const references = useReferenceOptions(field.source);
  if (!field.source)
    return (field.vocabulary ?? []).map((term) => ({ value: term, label: term }));
  const unknown = selected.filter(
    (value) => !references.some((option) => option.value === value),
  );
  return [
    ...references,
    ...unknown.map((value) => ({ value, label: `${value} (not defined)` })),
  ];
};

/** References, lists and open vocabularies. */
const OptionsSelect: React.FC<ControlProps> = (props) => {
  const { field, id, value, invalid, onChange } = props;
  const selected = toStrings(value);
  const options = useFieldOptions(field, selected);
  const common = {
    inputId: id,
    $options: options,
    $placeholder: "Not set",
    $invalid: invalid,
  };

  if (field.kind === "list")
    return (
      <SearchSelect
        {...common}
        $multi
        $creatable={!field.source}
        $value={selected}
        $onChange={(next) => onChange(next.length ? next : undefined)}
      />
    );
  return (
    <SearchSelect
      {...common}
      $creatable={field.kind !== "reference"}
      $value={selected[0]}
      $onChange={onChange}
    />
  );
};

const SwitchSelect: React.FC<ControlProps> = ({ id, text, invalid, onChange }) => {
  const variables = useReferenceOptions("variables");
  return (
    <SearchSelect
      inputId={id}
      $invalid={invalid}
      $creatable
      $placeholder="__variable__:value"
      $options={variables.map(({ value }) => ({
        value: `${value}:value`,
        label: `${value}:value`,
      }))}
      $value={text || undefined}
      $onChange={onChange}
    />
  );
};

const Control: React.FC<ControlProps> = (props) => {
  const { field, id, text, valueType, onChange } = props;

  switch (field.kind) {
    case "textarea":
      return (
        <TextArea
          id={id}
          value={text}
          onChange={(e) => onChange(textOrUndefined(e.target.value))}
        />
      );
    case "number":
      return (
        <Input
          id={id}
          type="number"
          value={text}
          onChange={(e) =>
            onChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
        />
      );
    case "timestamp":
      return (
        <Input
          id={id}
          type="datetime-local"
          value={toLocalInput(text)}
          onChange={(e) => onChange(fromLocalInput(e.target.value))}
        />
      );
    case "variable-value":
      return (
        <VariableInput
          id={id}
          variableKey={field.key}
          type={valueType ?? "string"}
          value={text}
          onChange={(_, next) => onChange(textOrUndefined(next))}
        />
      );
    case "switch":
      return <SwitchSelect {...props} />;
    case "reference":
    case "list":
      return <OptionsSelect {...props} />;
    default:
      if (field.vocabulary) return <OptionsSelect {...props} />;
      return (
        <Input
          id={id}
          value={text}
          onChange={(e) => onChange(textOrUndefined(e.target.value))}
        />
      );
  }
};

const Required: React.FC<{ field: Field }> = ({ field }) =>
  field.required ? <RequiredMark>*</RequiredMark> : null;

/** One form row for a field from the spec, with its error or warning. */
export const FieldInput: React.FC<FieldInputProps> = (props) => {
  const { field, value, path, onChange } = props;
  const id = useId();
  const issue = usePanelIssue(path);
  const invalid = !!issue?.blocking;
  const message = issue && (
    <FieldMessage $blocking={issue.blocking}>{issue.message}</FieldMessage>
  );

  if (field.kind === "entries" || field.kind === "items")
    return (
      <FormGroup data-invalid={invalid || undefined}>
        <SectionTitle>
          {field.label}
          <Required field={field} />
        </SectionTitle>
        <EntryListEditor
          field={field}
          value={value}
          path={path}
          onChange={onChange}
        />
        {message}
      </FormGroup>
    );

  if (field.kind === "boolean")
    return (
      <FormGroup>
        <CheckboxLabel>
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked || undefined)}
          />
          {field.label}
        </CheckboxLabel>
      </FormGroup>
    );

  return (
    <FormGroup data-invalid={invalid || undefined}>
      <FormLabel htmlFor={id}>
        {field.label}
        <Required field={field} />
      </FormLabel>
      <Control
        {...props}
        id={id}
        text={value === undefined || value === null ? "" : String(value)}
        invalid={invalid}
      />
      {message}
    </FormGroup>
  );
};
