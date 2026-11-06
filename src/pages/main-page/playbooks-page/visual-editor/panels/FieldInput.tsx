import { useId, useState } from "react";

import {
  FormGroup,
  FormLabel,
  Input,
  SearchSelect,
  type SearchSelectOption,
  ThemeSize,
} from "@/components";
import { VariableInput } from "@/pages/main-page/monitoring-page/timeline-tab-view/VariableInputs";

import { SOARCA_SOURCES } from "../model/references";
import { isRequired } from "../model/rules";
import type { Field, ReferenceSource } from "../model/specs";
import { EntryListEditor } from "./EntryListEditor";
import { fromLocalInput, toLocalInput } from "./localTime";
import {
  AddressRow,
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
  /** The `type` of the entry the field is in. Picks the input of a `variable-value` field. */
  entryType?: string;
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

const toOptions = (values: string[]): SearchSelectOption[] =>
  values.map((value) => ({ value, label: value }));

/** Addresses and headers: `{ name: [values] }`. */
type StringLists = Record<string, string[]>;

const toStringLists = (value: unknown): StringLists =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? Object.fromEntries(
        Object.entries(value).map(([name, values]) => [name, toStrings(values)]),
      )
    : {};

/**
 * Options of a select field. Values that are not in the options stay
 * selectable and are marked, so opening an imported playbook changes nothing.
 */
const useFieldOptions = (field: Field, selected: string[]): SearchSelectOption[] => {
  const references = useReferenceOptions(field.source);
  if (!field.source) return toOptions(field.vocabulary ?? []);
  const suffix = SOARCA_SOURCES.includes(field.source)
    ? "(not supported)"
    : "(not defined)";
  const unknown = selected.filter(
    (value) => !references.some((option) => option.value === value),
  );
  return [
    ...references,
    ...unknown.map((value) => ({ value, label: `${value} ${suffix}` })),
  ];
};

const EMPTY_MESSAGES: Partial<Record<ReferenceSource, string>> = {
  agents: "No agents yet. Add one in the playbook's Resources tab.",
  targets: "No targets yet. Add one in the playbook's Resources tab.",
  auth: "No authentication yet. Add one in the playbook's Resources tab.",
  variables:
    "No variables yet. Add one in the playbook's Resources tab or the step's Variables tab.",
  steps: "No steps yet. Add one on the canvas.",
};

/** References, lists and open vocabularies. Only vocabularies accept typed values. */
const OptionsSelect: React.FC<ControlProps> = (props) => {
  const { field, id, value, invalid, onChange } = props;
  const selected = toStrings(value);
  const options = useFieldOptions(field, selected);
  const common = {
    inputId: id,
    $size: ThemeSize.Small,
    $options: options,
    $placeholder: "Not set",
    $emptyMessage: field.source && !options.length ? EMPTY_MESSAGES[field.source] : undefined,
    $invalid: invalid,
    $creatable: !field.source,
  };

  if (field.kind === "list")
    return (
      <SearchSelect
        {...common}
        $multi
        $value={selected}
        $onChange={(next) => onChange(next.length ? next : undefined)}
      />
    );
  return <SearchSelect {...common} $value={selected[0]} $onChange={onChange} />;
};

const ADDRESS_TYPES = ["ipv4", "ipv6", "dname", "url", "l2mac", "vlan"];

/** Edits one address type and its values. Other types of an imported playbook are kept. */
const AddressInput: React.FC<ControlProps> = ({ id, value, invalid, onChange }) => {
  const address = toStringLists(value);
  const [type, setType] = useState(Object.keys(address)[0] ?? ADDRESS_TYPES[0]);
  const write = (nextType: string, values: string[]) => {
    const next = { ...address };
    delete next[type];
    if (values.length) next[nextType] = values;
    onChange(Object.keys(next).length ? next : undefined);
  };

  return (
    <AddressRow>
      <SearchSelect
        $size={ThemeSize.Small}
        $options={toOptions(ADDRESS_TYPES)}
        $value={type}
        $onChange={(nextType) => {
          if (!nextType) return;
          write(nextType, address[type] ?? []);
          setType(nextType);
        }}
      />
      <SearchSelect
        inputId={id}
        $size={ThemeSize.Small}
        $multi
        $creatable
        $options={[]}
        $placeholder="Type an address"
        $invalid={invalid}
        $value={address[type] ?? []}
        $onChange={(values) => write(type, values)}
      />
    </AddressRow>
  );
};

/** Headers as "Name: value" lines. */
const HeadersInput: React.FC<ControlProps> = ({ id, value, invalid, onChange }) => {
  const lines = Object.entries(toStringLists(value)).flatMap(([name, values]) =>
    values.map((headerValue) => `${name}: ${headerValue}`),
  );
  const write = (nextLines: string[]) => {
    const headers: StringLists = {};
    for (const line of nextLines) {
      const [name, ...rest] = line.split(":");
      if (name.trim()) (headers[name.trim()] ??= []).push(rest.join(":").trim());
    }
    onChange(Object.keys(headers).length ? headers : undefined);
  };

  return (
    <SearchSelect
      inputId={id}
      $size={ThemeSize.Small}
      $multi
      $creatable
      $options={[]}
      $placeholder="Accept: application/json"
      $invalid={invalid}
      $value={lines}
      $onChange={write}
    />
  );
};

const SwitchSelect: React.FC<ControlProps> = ({ id, text, invalid, onChange }) => {
  const variables = useReferenceOptions("variables");
  const options = toOptions(variables.map(({ value }) => `${value}:value`));
  return (
    <SearchSelect
      inputId={id}
      $size={ThemeSize.Small}
      $invalid={invalid}
      $creatable
      $placeholder="__variable__:value"
      $options={options}
      $value={text || undefined}
      $onChange={onChange}
    />
  );
};

const Control: React.FC<ControlProps> = (props) => {
  const { field, id, text, entryType, onChange } = props;

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
          $size={ThemeSize.Small}
          type="number"
          min={field.min}
          max={field.max}
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
          $size={ThemeSize.Small}
          type="datetime-local"
          value={toLocalInput(text)}
          onChange={(e) => onChange(fromLocalInput(e.target.value))}
        />
      );
    case "variable-value":
      return (
        <VariableInput
          id={id}
          $size={ThemeSize.Small}
          variableKey={field.key}
          type={entryType ?? "string"}
          value={text}
          onChange={(_, next) => onChange(textOrUndefined(next))}
        />
      );
    case "switch":
      return <SwitchSelect {...props} />;
    case "address":
      return <AddressInput {...props} />;
    case "headers":
      return <HeadersInput {...props} />;
    case "reference":
    case "list":
      return <OptionsSelect {...props} />;
    default:
      if (field.vocabulary || field.source) return <OptionsSelect {...props} />;
      return (
        <Input
          id={id}
          $size={ThemeSize.Small}
          value={text}
          onChange={(e) => onChange(textOrUndefined(e.target.value))}
        />
      );
  }
};

const Required: React.FC<{ field: Field; entryType?: string }> = ({
  field,
  entryType,
}) => (isRequired(field, entryType) ? <RequiredMark>*</RequiredMark> : null);

/** One form row for a field from the spec, with its error or warning. */
export const FieldInput: React.FC<FieldInputProps> = (props) => {
  const { field, value, path, entryType, onChange } = props;
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
        <Required field={field} entryType={entryType} />
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
