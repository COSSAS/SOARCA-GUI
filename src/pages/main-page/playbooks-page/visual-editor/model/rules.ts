import { ThemeVariant } from "@/components/utils";
import type { Playbook, Step } from "@/types";

import { getStepFields, isEmptyValue } from "./fields";
import type {
  CacaoSpec,
  ConnectionKind,
  Field,
  PanelTab,
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

const getFieldIssues = (
  value: Record<string, unknown>,
  field: Field,
  tab: PanelTab,
  path = "",
): Issue[] => {
  const fieldValue = value[field.key];
  const at = path + field.key;
  // A command can be given base64 encoded instead.
  const hasAlternative = field.key === "command" && !!value.command_b64;
  if (field.required && isEmptyValue(fieldValue) && !hasAlternative)
    return [{ field: at, tab, message: `${field.label} is required`, blocking: true }];

  const entryFields = field.entry;
  if (entryFields && fieldValue && typeof fieldValue === "object")
    return Object.entries(fieldValue).flatMap(([id, entry]) =>
      entryFields.flatMap((entryField) =>
        getFieldIssues(entry, entryField, tab, `${at}.${id}.`),
      ),
    );

  return [];
};

export const getStepIssues = (
  step: Step,
  definition: StepTypeDefinition | undefined,
  spec: CacaoSpec,
): Issue[] => {
  if (!definition)
    return [
      {
        message: `Step type "${step.type}" is not part of ${spec.version}`,
        blocking: false,
      },
    ];

  const fieldIssues = getStepFields(spec, definition).flatMap((field) =>
    getFieldIssues(step, field, field.tab),
  );

  const linkIssues = definition.connections.flatMap((kind): Issue[] => {
    const min = definition.minLinks?.[kind];
    if (min === undefined || countLinks(step, kind) >= min) return [];
    const label = CONNECTION_LABELS[kind];
    return [
      {
        message:
          min === 1
            ? `Needs a "${label}" connection`
            : `Needs at least ${min} "${label}" connections`,
        blocking: false,
      },
    ];
  });

  return [...fieldIssues, ...linkIssues];
};

export const getPlaybookIssues = (playbook: Playbook, spec: CacaoSpec): Issue[] => [
  ...(playbook.workflow_start
    ? []
    : [{ message: "Add a start step", blocking: false }]),
  ...spec.playbookFields.flatMap((field) =>
    getFieldIssues(playbook, field, field.tab),
  ),
];

/** Owner id of playbook issues and JSON drafts. Steps use their step id. */
export const PLAYBOOK_OWNER = "playbook";

export type OwnedIssue = Issue & { ownerId: string };

/** Issues of the playbook and of every step. */
export const getAllIssues = (playbook: Playbook, spec: CacaoSpec): OwnedIssue[] => [
  ...getPlaybookIssues(playbook, spec).map((issue) => ({
    ...issue,
    ownerId: PLAYBOOK_OWNER,
  })),
  ...Object.entries(playbook.workflow).flatMap(([ownerId, step]) =>
    getStepIssues(step, spec.stepTypes[step.type], spec).map((issue) => ({
      ...issue,
      ownerId,
    })),
  ),
];

/**
 * The first thing that prevents saving: a missing required field or a JSON box
 * with invalid JSON. Warnings never block.
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

export const canAddStep = (playbook: Playbook, type: string): boolean =>
  type !== "start" ||
  !Object.values(playbook.workflow).some((step) => step.type === "start");

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
