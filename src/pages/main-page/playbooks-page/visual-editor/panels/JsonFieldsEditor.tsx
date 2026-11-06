import { useId } from "react";

import { CodeEditor } from "@/components";

import { useJsonDrafts } from "./jsonDrafts";
import { FieldMessage, Hint, SectionTitle } from "./Panel.styles";
import { usePanelForm } from "./panelForm";

type JsonFieldsEditorProps = {
  label: string;
  hint?: string;
  /** Path of the edited object, unique within its step or playbook. */
  path: string;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
};

const parseObject = (text: string): Record<string, unknown> => {
  const parsed = JSON.parse(text.trim() || "{}");
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw new Error("Must be a JSON object");
  return parsed;
};

const sameJson = (text: string, value: unknown) => {
  try {
    return JSON.stringify(parseObject(text)) === JSON.stringify(value);
  } catch {
    return false;
  }
};

/** JSON box for the fields that have no form input. Changes are applied as soon as the JSON is valid. */
export const JsonFieldsEditor: React.FC<JsonFieldsEditorProps> = ({
  label,
  hint,
  path,
  value,
  onChange,
}) => {
  const id = useId();
  const { ownerId, tab } = usePanelForm();
  const { drafts, setDraft } = useJsonDrafts();
  const draftId = `${ownerId}/${path}`;
  const draft = drafts[draftId];
  const error = draft?.error;
  // The typed text is kept while it is invalid or still matches the value, so
  // formatting is not reset while typing. Other changes show the new value.
  const text =
    draft && (error || sameJson(draft.text, value))
      ? draft.text
      : JSON.stringify(value, null, 2);

  const handleChange = (next: string) => {
    try {
      const parsed = parseObject(next);
      setDraft(draftId, { ownerId, tab, text: next });
      onChange(parsed);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid JSON";
      setDraft(draftId, { ownerId, tab, text: next, error: message });
    }
  };

  return (
    <div data-invalid={!!error || undefined}>
      <SectionTitle as="label" htmlFor={id}>
        {label}
      </SectionTitle>
      {hint && <Hint>{hint}</Hint>}
      <CodeEditor
        $inputId={id}
        $value={text}
        $onChange={handleChange}
        $hasError={!!error}
        $minHeight="24rem"
      />
      {error && <FieldMessage $blocking>{error}</FieldMessage>}
    </div>
  );
};
