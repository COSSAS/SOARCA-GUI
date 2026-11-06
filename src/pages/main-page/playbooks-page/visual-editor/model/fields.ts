import type { Step } from "@/types";

import { LAYOUT_EXTENSION_ID } from "./coordinates";
import type { CacaoSpec, StepField, StepTypeDefinition } from "./specs";

type Fields = Record<string, unknown>;

const omit = (value: object, keys: string[]): Fields =>
  Object.fromEntries(Object.entries(value).filter(([k]) => !keys.includes(k)));

const pick = (value: object, keys: string[]): Fields =>
  Object.fromEntries(Object.entries(value).filter(([k]) => keys.includes(k)));

/** The form fields of a step: the common ones, then those of its type. */
export const getStepFields = (
  spec: CacaoSpec,
  definition: StepTypeDefinition | undefined,
): StepField[] => [...spec.commonFields, ...(definition?.fields ?? [])];

/** Step keys edited by the form or the diagram. The rest is shown in the JSON box. */
export const getOwnedStepKeys = (
  spec: CacaoSpec,
  definition: StepTypeDefinition | undefined,
): string[] => [
  "type",
  ...getStepFields(spec, definition).map((field) => field.key),
  ...(definition?.connections ?? []),
];

/** The fields for the JSON box. The layout extension is left out: it changes while dragging. */
export const getExtraStepFields = (step: Step, owned: string[]): Fields => {
  const extra = omit(step, owned);
  if (!step.step_extensions) return extra;
  const extensions = omit(step.step_extensions, [LAYOUT_EXTENSION_ID]);
  if (Object.keys(extensions).length) extra.step_extensions = extensions;
  else delete extra.step_extensions;
  return extra;
};

/** Replaces the extra fields of a step and keeps its owned fields and layout. */
export const setExtraStepFields = (
  step: Step,
  owned: string[],
  extra: Fields,
): Step => {
  const next = { ...extra, ...pick(step, owned) } as Step;
  const layout = step.step_extensions?.[LAYOUT_EXTENSION_ID];
  if (layout) {
    next.step_extensions = {
      ...(extra.step_extensions as Fields | undefined),
      [LAYOUT_EXTENSION_ID]: layout,
    };
  }
  return next;
};

export const getExtraFields = (value: object, owned: string[]) =>
  omit(value, owned);

export const setExtraFields = <T extends object>(
  value: T,
  owned: string[],
  extra: Fields,
): T => ({ ...extra, ...pick(value, owned) }) as T;

/** Playbook keys edited by the form or the diagram. The rest is shown in the JSON box. */
export const getOwnedPlaybookKeys = (spec: CacaoSpec): string[] => [
  ...spec.protectedPlaybookKeys,
  ...spec.playbookFields.map((field) => field.key),
];

export const isEmptyValue = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "") ||
  (typeof value === "object" && Object.keys(value).length === 0);

/** Sets a form value. Empty values remove the field instead of saving "", [] or {}. */
export const setField = <T extends object>(
  value: T,
  key: string,
  input: unknown,
): T => {
  const next: Fields = { ...(value as Fields) };
  if (isEmptyValue(input)) delete next[key];
  else next[key] = input;
  return next as T;
};
