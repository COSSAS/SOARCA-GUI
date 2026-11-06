import { IconChevronRight, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";

import { Button, Icon, Input, SearchSelect, ThemeSize, ThemeVariant } from "@/components";

import { setField } from "../model/fields";
import type { Field } from "../model/specs";
import { FieldInput } from "./FieldInput";
import {
  AddEntryButton,
  AddEntryForm,
  AddEntryName,
  EntryActions,
  EntryBody,
  EntryChevron,
  EntryItem,
  EntryList,
  EntryTitle,
  EntryToggle,
  EntryType,
  FieldMessage,
  IssueCount,
} from "./Panel.styles";
import { useEntryIssues, useReferenceOptions } from "./panelForm";

type Entry = Record<string, unknown>;
type EntryPair = [id: string, entry: Entry];

type EntryListEditorProps = {
  field: Field;
  value: unknown;
  path: string;
  onChange: (value: unknown) => void;
};

const isEntry = (value: unknown): value is Entry =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** `items` are an array and `entries` an object by id. Both are edited as [id, entry] pairs. */
const readEntries = (value: unknown, isList: boolean): EntryPair[] => {
  const toPair = (id: string, entry: unknown): EntryPair => [id, isEntry(entry) ? entry : {}];
  if (isList)
    return Array.isArray(value) ? value.map((entry, i) => toPair(String(i), entry)) : [];
  return isEntry(value) ? Object.entries(value).map(([id, entry]) => toPair(id, entry)) : [];
};

const writeEntries = (pairs: EntryPair[], isList: boolean): unknown =>
  isList ? pairs.map(([, entry]) => entry) : Object.fromEntries(pairs);

const isVariableField = (field: Field) => field.newEntry?.id === "variable";

/** `__name__` for variables, `type--uuid` for agents, targets and authentication. */
const newEntryId = (field: Field, name: string): string =>
  isVariableField(field)
    ? `__${name.replace(/^_+|_+$/g, "").replace(/\s+/g, "_")}__`
    : `${field.newEntry?.defaults.type}--${crypto.randomUUID()}`;

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const entryName = (id: string, entry: Entry) =>
  typeof entry.name === "string" && entry.name ? entry.name : id;

type EntryRowProps = {
  fields: Field[];
  itemLabel: string;
  title: string;
  entry: Entry;
  path: string;
  open: boolean;
  onToggle: () => void;
  onChange: (entry: Entry) => void;
  onRemove: () => void;
};

const EntryRow: React.FC<EntryRowProps> = ({
  fields,
  itemLabel,
  title,
  entry,
  path,
  open,
  onToggle,
  onChange,
  onRemove,
}) => {
  const issues = useEntryIssues(path);
  const blocking = issues.some((issue) => issue.blocking);
  const type = typeof entry.type === "string" ? entry.type : undefined;
  const visibleFields = fields.filter(
    (entryField) => !entryField.forTypes || (type && entryField.forTypes.includes(type)),
  );

  return (
    <EntryItem>
      <EntryToggle
        type="button"
        // While closed, the save check focuses the row instead of the hidden field.
        data-invalid={(blocking && !open) || undefined}
        onClick={onToggle}
      >
        <EntryChevron $open={open}>
          <Icon $icon={IconChevronRight} $size={ThemeSize.Small} />
        </EntryChevron>
        <EntryTitle title={title}>{title}</EntryTitle>
        {type && <EntryType>{type}</EntryType>}
        {issues.length > 0 && (
          <IssueCount $blocking={blocking}>{issues.length}</IssueCount>
        )}
      </EntryToggle>
      {open && (
        <EntryBody>
          {visibleFields.map((entryField) => (
            <FieldInput
              key={entryField.key}
              field={entryField}
              value={entry[entryField.key]}
              path={`${path}.${entryField.key}`}
              entryType={type}
              onChange={(next) => onChange(setField(entry, entryField.key, next))}
            />
          ))}
          <EntryActions>
            <Button
              type="button"
              $variant={ThemeVariant.Error}
              $size={ThemeSize.Small}
              $ghost
              onClick={onRemove}
            >
              <Icon $icon={IconTrash} $size={ThemeSize.Small} />
              Remove {itemLabel}
            </Button>
          </EntryActions>
        </EntryBody>
      )}
    </EntryItem>
  );
};

/**
 * Edits an object of entries by id (`entries`) or an array of entries (`items`).
 * Each entry is a row that opens to edit it. One row is open at a time.
 */
export const EntryListEditor: React.FC<EntryListEditorProps> = ({
  field,
  value,
  path,
  onChange,
}) => {
  const [openId, setOpenId] = useState<string>();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const isList = field.kind === "items";
  const pairs = readEntries(value, isList);
  const itemLabel = field.itemLabel ?? field.label.toLowerCase();
  const isVariable = isVariableField(field);
  // Agents are named by their capability, so the name is picked from a list.
  const nameField = field.entry?.find((entryField) => entryField.key === "name");
  const nameSource = nameField?.source;
  const nameOptions = useReferenceOptions(nameSource);
  // Commands start with a type the step's agent can run.
  const typeSource = field.entry?.find((entryField) => entryField.key === "type")?.source;
  const firstType = useReferenceOptions(typeSource)[0]?.value;

  const save = (next: EntryPair[]) => onChange(writeEntries(next, isList));

  const add = () => {
    const defaults = field.newEntry?.defaults ?? {};
    if (isList) {
      const entry = firstType ? { ...defaults, type: firstType } : { ...defaults };
      save([...pairs, [String(pairs.length), entry]]);
      setOpenId(String(pairs.length));
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setError(nameSource ? `Pick a ${nameField?.label.toLowerCase()} first` : "Enter a name first");
      return;
    }
    const id = newEntryId(field, trimmed);
    if (pairs.some(([other]) => other === id)) {
      setError(`${id} already exists`);
      return;
    }
    // Variables are named by their id, the other entries by a name field.
    save([...pairs, [id, isVariable ? { ...defaults } : { ...defaults, name: trimmed }]]);
    setOpenId(id);
    setName("");
    setError("");
  };

  const remove = (id: string) => {
    save(pairs.filter(([other]) => other !== id));
    setOpenId(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    add();
  };

  return (
    <>
      {pairs.length > 0 && (
        <EntryList>
          {pairs.map(([id, entry], i) => (
            <EntryRow
              key={id}
              fields={field.entry ?? []}
              itemLabel={itemLabel}
              title={
                isList
                  ? `${capitalize(itemLabel)} ${i + 1}`
                  : entryName(id, entry)
              }
              entry={entry}
              path={`${path}.${id}`}
              open={openId === id}
              onToggle={() => setOpenId(openId === id ? undefined : id)}
              onChange={(next) =>
                save(pairs.map((pair) => (pair[0] === id ? [id, next] : pair)))
              }
              onRemove={() => remove(id)}
            />
          ))}
        </EntryList>
      )}
      <AddEntryForm onSubmit={handleSubmit}>
        {!isList && nameSource && (
          <AddEntryName>
            <SearchSelect
              $size={ThemeSize.Small}
              $options={nameOptions}
              $placeholder={nameField?.label}
              $value={name || undefined}
              $onChange={(next) => setName(next ?? "")}
            />
          </AddEntryName>
        )}
        {!isList && !nameSource && (
          <Input
            $size={ThemeSize.Small}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <AddEntryButton
          type="submit"
          $variant={ThemeVariant.Primary}
          $size={ThemeSize.Small}
          $ghost
        >
          <Icon $icon={IconPlus} $size={ThemeSize.Small} />
          Add {itemLabel}
        </AddEntryButton>
      </AddEntryForm>
      {error && <FieldMessage $blocking>{error}</FieldMessage>}
    </>
  );
};
