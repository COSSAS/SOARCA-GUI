import type { Playbook, Step } from "@/types";
import { decodeBase64 } from "@/utils";

import { getStepFields } from "../visual-editor/model/fields";
import { getSpec } from "../visual-editor/model/specs";

// Shown elsewhere: at the top of "General", in their own section, or as arrows in the diagram.
const OMITTED_FIELDS = new Set([
  "id",
  "uuid",
  "type",
  "name",
  "description",
  "commands",
  "cases",
  "next_steps",
  "on_completion",
  "on_failure",
  "on_false",
  "on_success",
  "on_true",
  "step_extensions",
]);

/** `out_args` reads as "Out args", matching the spec field labels. */
const toLabel = (key: string) => {
  const words = key.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export type StepDetail = { key: string; label: string; value: unknown };

/** The type label and the remaining fields of a step: spec fields first, in spec order, then any others. */
export const getStepDetails = (step: Step, playbook: Playbook) => {
  const spec = getSpec(playbook.spec_version);
  const definition = spec?.stepTypes[step.type];
  const fields = spec ? getStepFields(spec, definition) : [];
  const known = new Set<string>(fields.map((field) => field.key));
  const details: StepDetail[] = [
    ...fields
      .filter(
        (field) =>
          !OMITTED_FIELDS.has(field.key) && step[field.key] !== undefined,
      )
      .map((field) => ({
        key: field.key,
        label: field.label,
        value: step[field.key],
      })),
    ...Object.entries(step)
      .filter(
        ([key, value]) =>
          !known.has(key) && !OMITTED_FIELDS.has(key) && value !== undefined,
      )
      .map(([key, value]) => ({ key, label: toLabel(key), value })),
  ];
  return { typeLabel: definition?.label ?? step.type, details };
};

/** The plain value, or else the base64 one decoded. */
export const readText = (plain?: string, base64?: string) => {
  if (plain) return { text: plain, decoded: false };
  if (!base64) return undefined;
  return { text: decodeBase64(base64) ?? base64, decoded: true };
};

/** Pretty-printed JSON; text that looks like JSON but does not parse is flagged. */
export const readContent = (text: string) => {
  try {
    return { code: JSON.stringify(JSON.parse(text), null, 2), invalid: false };
  } catch {
    return { code: text, invalid: /^\s*[[{]/.test(text) };
  }
};
