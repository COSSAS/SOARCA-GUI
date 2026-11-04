import { ThemeVariant } from "@/components/utils";
import type { Playbook, Step } from "@/types";

import { getStepFields, isEmptyValue } from "./fields";
import { getReferenceOptions, SOARCA_SOURCES } from "./references";
import {
  CONDITION_HINT,
  isConditionSupported,
  isStepTypeSupported,
} from "./soarca";
import type {
  CacaoSpec,
  ConnectionKind,
  Field,
  PanelTab,
  ReferenceSource,
  StepColor,
  StepTypeDefinition,
} from "./specs";

/** Short names of the connections, as shown on the ports. */
export const CONNECTION_LABELS: Record<ConnectionKind, string> = {
  on_completion: "next",
  on_success: "success",
  on_failure: "failure",
  on_true: "true",
  on_false: "false",
  next_steps: "branches",
  cases: "case",
};

/** Colour of each connection, used by both its edges and its ports. Fan-out connections take the colour of their step type. */
export const CONNECTION_COLORS: Record<ConnectionKind, StepColor> = {
  on_completion: ThemeVariant.Primary,
  on_success: ThemeVariant.Success,
  on_failure: ThemeVariant.Error,
  on_true: ThemeVariant.Success,
  on_false: ThemeVariant.Error,
  next_steps: ThemeVariant.Accent,
  cases: "orange",
};

export const countLinks = (step: Step, kind: ConnectionKind): number => {
  if (kind === "cases") return Object.keys(step.cases ?? {}).length;
  if (kind === "next_steps") return step.next_steps?.length ?? 0;
  return step[kind] ? 1 : 0;
};

/** One arrow in the diagram: `source` points to `target` through `kind` (and the case `key` for switches). */
export type Link = {
  source: string;
  kind: ConnectionKind;
  key?: string;
  target: string;
};

/** All outgoing links of a step, for the connections its type allows. */
export const getLinks = (
  stepId: string,
  step: Step,
  definition: StepTypeDefinition | undefined,
): Link[] =>
  (definition?.connections ?? []).flatMap((kind): Link[] => {
    if (kind === "cases") {
      return Object.entries(step.cases ?? {}).map(([key, target]) => ({
        source: stepId,
        kind,
        key,
        target,
      }));
    }
    if (kind === "next_steps") {
      return (step.next_steps ?? []).map((target) => ({
        source: stepId,
        kind,
        target,
      }));
    }
    const target = step[kind];
    return target ? [{ source: stepId, kind, target }] : [];
  });

export const getAllLinks = (playbook: Playbook, spec: CacaoSpec): Link[] =>
  Object.entries(playbook.workflow).flatMap(([id, step]) =>
    getLinks(id, step, spec.stepTypes[step.type]),
  );

/** Connections that cannot be used because a conflicting one is already set, e.g. `on_success` when `on_completion` is set. */
export const getBlockedConnections = (
  step: Step,
  spec: CacaoSpec,
): ConnectionKind[] =>
  Object.entries(spec.conflicts).flatMap(([kind, blocks]) =>
    countLinks(step, kind as ConnectionKind) > 0 ? (blocks ?? []) : [],
  );

/**
 * A problem shown next to a field, or on the whole step when `field` is undefined.
 * Blocking issues prevent saving, the others are warnings.
 */
export type Issue = {
  /** Path from the step or playbook, e.g. "commands.0.command". */
  field?: string;
  tab?: PanelTab;
  message: string;
  blocking: boolean;
};

/** The step and playbook a field belongs to, for the checks that look up other parts. */
type Context = { playbook: Playbook; step?: Step };

const PLAYBOOK_SOURCES: ReferenceSource[] = ["agents", "targets", "auth"];

/** Whether the field is required, also by the `type` of the entry it is in. */
export const isRequired = (field: Field, entryType: unknown): boolean =>
  !!field.required ||
  (typeof entryType === "string" && !!field.requiredForTypes?.includes(entryType));

/** An undefined agent, target or authentication blocks. A value SOARCA cannot run only warns. */
const getReferenceIssue = (
  field: Field,
  value: unknown,
  context: Context,
): Pick<Issue, "message" | "blocking"> | undefined => {
  const source = field.source;
  if (!source || isEmptyValue(value)) return undefined;
  const isSoarca = SOARCA_SOURCES.includes(source);
  if (!isSoarca && !PLAYBOOK_SOURCES.includes(source)) return undefined;

  const known = getReferenceOptions(context.playbook, source, context.step).map(
    (option) => option.value,
  );
  const missing = [value].flat().find((item) => !known.includes(String(item)));
  if (missing === undefined) return undefined;
  return isSoarca
    ? { message: `SOARCA cannot run "${missing}" here`, blocking: false }
    : { message: `"${missing}" is not defined in this playbook`, blocking: true };
};

const getFieldIssues = (
  value: Record<string, unknown>,
  field: Field,
  tab: PanelTab,
  context: Context,
  path = "",
): Issue[] => {
  const fieldValue = value[field.key];
  const at = path + field.key;
  const issue = (message: string, blocking = true): Issue[] => [
    { field: at, tab, message, blocking },
  ];

  // A command can be given base64 encoded instead.
  const hasAlternative = field.key === "command" && !!value.command_b64;
  if (isRequired(field, value.type) && isEmptyValue(fieldValue) && !hasAlternative)
    return issue(`${field.label} is required`);

  if (typeof fieldValue === "number") {
    if (field.min !== undefined && fieldValue < field.min)
      return issue(`${field.label} must be at least ${field.min}`);
    if (field.max !== undefined && fieldValue > field.max)
      return issue(`${field.label} must be at most ${field.max}`);
  }

  const reference = getReferenceIssue(field, fieldValue, context);
  if (reference) return issue(reference.message, reference.blocking);

  const entryFields = field.entry;
  if (entryFields && fieldValue && typeof fieldValue === "object")
    return Object.entries(fieldValue).flatMap(([id, entry]) =>
      entryFields.flatMap((entryField) =>
        getFieldIssues(entry, entryField, tab, context, `${at}.${id}.`),
      ),
    );

  return [];
};

/** Steps whose link goes back to a step before them, found from the start step. SOARCA rejects loops. */
const findLoopSteps = (playbook: Playbook, spec: CacaoSpec): Set<string> => {
  const loopSteps = new Set<string>();
  const done = new Set<string>();
  const onPath = new Set<string>();

  const visit = (id: string) => {
    const step = playbook.workflow[id];
    if (!step || done.has(id)) return;
    onPath.add(id);
    for (const { target } of getLinks(id, step, spec.stepTypes[step.type])) {
      if (onPath.has(target)) loopSteps.add(id);
      else visit(target);
    }
    onPath.delete(id);
    done.add(id);
  };

  if (playbook.workflow_start) visit(playbook.workflow_start);
  return loopSteps;
};

const getLinkIssues = (
  stepId: string,
  step: Step,
  definition: StepTypeDefinition,
): Issue[] => {
  const missing = definition.connections.flatMap((kind): Issue[] => {
    const min = definition.minLinks?.[kind];
    if (min === undefined || countLinks(step, kind) >= min) return [];
    const label = CONNECTION_LABELS[kind];
    return [
      {
        message:
          min === 1
            ? `Needs a "${label}" connection`
            : `Needs at least ${min} "${label}" connections`,
        blocking: true,
      },
    ];
  });
  if (missing.length) return missing;

  const isDeadEnd =
    step.type !== "end" && getLinks(stepId, step, definition).length === 0;
  return isDeadEnd
    ? [{ message: "Connect this step to a next step", blocking: true }]
    : [];
};

const getStepIssues = (
  stepId: string,
  context: Context & { step: Step },
  spec: CacaoSpec,
  inLoop: boolean,
): Issue[] => {
  const { step } = context;
  const definition = spec.stepTypes[step.type];
  if (!definition)
    return [
      {
        message: `Step type "${step.type}" is not part of ${spec.version}`,
        blocking: false,
      },
    ];

  const fields = getStepFields(spec, definition);
  const fieldIssues = fields.flatMap((field) =>
    getFieldIssues(step, field, field.tab, context),
  );
  const condition = fields.find((field) => field.key === "condition");
  const conditionIssues: Issue[] =
    condition &&
    step.condition &&
    !fieldIssues.length &&
    !isConditionSupported(step.condition)
      ? [{ field: "condition", tab: condition.tab, message: CONDITION_HINT, blocking: false }]
      : [];

  return [
    ...(isStepTypeSupported(step.type)
      ? []
      : [{ message: "SOARCA does not run this step type yet", blocking: false }]),
    ...fieldIssues,
    ...conditionIssues,
    ...getLinkIssues(stepId, step, definition),
    ...(inLoop
      ? [{ message: "This connection makes a loop, SOARCA does not allow loops", blocking: true }]
      : []),
  ];
};

const getPlaybookIssues = (playbook: Playbook, spec: CacaoSpec): Issue[] => {
  const start = playbook.workflow_start;
  return [
    ...(start && playbook.workflow[start]
      ? []
      : [{ message: "Add a start step", blocking: true }]),
    ...spec.playbookFields.flatMap((field) =>
      getFieldIssues(playbook, field, field.tab, { playbook }),
    ),
  ];
};

/** Owner id of playbook issues and JSON drafts. Steps use their step id. */
export const PLAYBOOK_OWNER = "playbook";

type OwnedIssue = Issue & { ownerId: string };

/** Issues of the playbook and of every step. */
export const getAllIssues = (playbook: Playbook, spec: CacaoSpec): OwnedIssue[] => {
  const loopSteps = findLoopSteps(playbook, spec);
  return [
    ...getPlaybookIssues(playbook, spec).map((issue) => ({
      ...issue,
      ownerId: PLAYBOOK_OWNER,
    })),
    ...Object.entries(playbook.workflow).flatMap(([ownerId, step]) =>
      getStepIssues(ownerId, { playbook, step }, spec, loopSteps.has(ownerId)).map(
        (issue) => ({ ...issue, ownerId }),
      ),
    ),
  ];
};

/**
 * The first thing that prevents saving: an issue that SOARCA would reject, or a
 * JSON box with invalid JSON. Warnings never block.
 */
export const findSaveBlocker = (
  issues: OwnedIssue[],
  invalidJson: { ownerId: string; tab: PanelTab }[],
): { ownerId: string; tab?: PanelTab; message: string } | undefined => {
  const blocking = issues.find((issue) => issue.blocking);
  if (blocking) return blocking;
  const [draft] = invalidJson;
  return draft && { ...draft, message: "Fix the invalid JSON" };
};

/** One start step per playbook, and only step types SOARCA can run. */
export const canAddStep = (playbook: Playbook, type: string): boolean =>
  isStepTypeSupported(type) &&
  (type !== "start" ||
    !Object.values(playbook.workflow).some((step) => step.type === "start"));

export const canConnect = (
  playbook: Playbook,
  spec: CacaoSpec,
  link: { source: string; kind: ConnectionKind; target: string },
): boolean => {
  const source = playbook.workflow[link.source];
  const target = playbook.workflow[link.target];
  if (!source || !target || link.source === link.target) return false;
  if (target.type === "start") return false;

  const definition = spec.stepTypes[source.type];
  if (!definition?.connections.includes(link.kind)) return false;
  if (getBlockedConnections(source, spec).includes(link.kind)) return false;
  if (link.kind === "next_steps")
    return !source.next_steps?.includes(link.target);
  return true;
};

/** The step a port points to now. `next_steps` and a new case have none. */
const getCurrentTarget = (step: Step, kind: ConnectionKind, key?: string) => {
  if (kind === "cases") return key ? step.cases?.[key] : undefined;
  if (kind === "next_steps") return undefined;
  return step[kind];
};

/** Targets a port may connect to, excluding its current destination. */
export const getConnectTargets = (
  playbook: Playbook,
  spec: CacaoSpec,
  sourceId: string,
  kind: ConnectionKind,
  key?: string,
): string[] => {
  const source = playbook.workflow[sourceId];
  if (!source) return [];
  const currentTarget = getCurrentTarget(source, kind, key);

  return Object.keys(playbook.workflow).filter(
    (target) =>
      target !== currentTarget &&
      canConnect(playbook, spec, { source: sourceId, kind, target }),
  );
};
