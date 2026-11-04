import type { Playbook, Step } from "@/types";

import type { Position } from "./coordinates";
import {
  CONNECTION_LABELS,
  countLinks,
  getAllIssues,
  getAllLinks,
  getBlockedConnections,
  type Issue,
  type Link,
} from "./rules";
import type { CacaoSpec, ConnectionKind, StepTypeDefinition } from "./specs";

export type StepNodeData = {
  step: Step;
  /** Undefined when the spec does not know the step type. */
  definition?: StepTypeDefinition;
  issues: Issue[];
  blocked: ConnectionKind[];
  /** Number of arrows ending at this step; more than one are spread over its top. */
  incoming: number;
  readOnly: boolean;
};

// Shapes that match React Flow's Node and Edge, so this file does not depend on React Flow.
type GraphNode = {
  id: string;
  type: "step";
  position: Position;
  data: StepNodeData;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle?: string;
  className: string;
  data: Link;
};

/** An outgoing connection point drawn at the bottom of a step. */
type Port = {
  handleId: string;
  kind: ConnectionKind;
  label: string;
  linked: boolean;
};

/** Handle used to add a new case to a switch step. */
const NEW_CASE_HANDLE = "new-case";

const SEPARATOR = "::";

/** Target handle where the `index`-th incoming arrow of a step ends. */
export const toIncomingHandleId = (index: number) => `in${SEPARATOR}${index}`;

export const toHandleId = (kind: ConnectionKind, key?: string) =>
  kind === "cases" ? `${kind}${SEPARATOR}${key}` : kind;

export const parseHandleId = (
  handle: string,
): { kind: ConnectionKind; key?: string } => {
  if (handle === NEW_CASE_HANDLE) return { kind: "cases" };
  const [kind, ...key] = handle.split(SEPARATOR);
  return key.length
    ? { kind: kind as ConnectionKind, key: key.join(SEPARATOR) }
    : { kind: kind as ConnectionKind };
};

const toEdge = (link: Link): GraphEdge => ({
  id: [link.source, link.kind, link.key ?? link.target].join(SEPARATOR),
  source: link.source,
  target: link.target,
  sourceHandle: toHandleId(link.kind, link.key),
  className: `edge-${link.kind}`,
  data: link,
});

/**
 * The ports of a step: one per connection, one per switch case, plus one to add a new case.
 * Connections blocked by one already set (e.g. success when next is set) are left out,
 * and a read-only step shows only linked ports.
 */
export const getPorts = ({
  step,
  definition,
  blocked,
  readOnly,
}: Pick<StepNodeData, "step" | "definition" | "blocked" | "readOnly">): Port[] =>
  (definition?.connections ?? [])
    .flatMap((kind): Port[] => {
      if (blocked.includes(kind)) return [];
      if (kind === "cases") {
        const cases = Object.keys(step.cases ?? {}).map((key) => ({
          handleId: toHandleId(kind, key),
          kind,
          label: key,
          linked: true,
        }));
        return [
          ...cases,
          { handleId: NEW_CASE_HANDLE, kind, label: "+ case", linked: false },
        ];
      }
      return [
        {
          handleId: toHandleId(kind),
          kind,
          label: CONNECTION_LABELS[kind],
          linked: countLinks(step, kind) > 0,
        },
      ];
    })
    .filter((port) => !readOnly || port.linked);

// Edits replace only the steps they change, so an unchanged step object can keep its
// node data. The same data object lets the memoized StepNode skip re-rendering.
const nodeDataCache = new WeakMap<Step, { spec: CacaoSpec; data: StepNodeData }>();

const sameIssues = (a: Issue[], b: Issue[]) =>
  a.length === b.length &&
  a.every(
    (issue, i) =>
      issue.message === b[i].message &&
      issue.field === b[i].field &&
      issue.blocking === b[i].blocking,
  );

const getNodeData = (
  step: Step,
  spec: CacaoSpec,
  issues: Issue[],
  incoming: number,
  readOnly: boolean,
): StepNodeData => {
  const cached = nodeDataCache.get(step);
  if (
    cached?.spec === spec &&
    cached.data.incoming === incoming &&
    cached.data.readOnly === readOnly &&
    sameIssues(cached.data.issues, issues)
  )
    return cached.data;

  const definition = spec.stepTypes[step.type];
  const data: StepNodeData = {
    step,
    definition,
    issues,
    blocked: getBlockedConnections(step, spec),
    incoming,
    readOnly,
  };
  nodeDataCache.set(step, { spec, data });
  return data;
};

/** Builds the diagram nodes and edges from a playbook. Links to missing steps are skipped. */
export const playbookToGraph = (
  playbook: Playbook,
  spec: CacaoSpec,
  positions: Record<string, Position>,
  readOnly = false,
): { nodes: GraphNode[]; edges: GraphEdge[] } => {
  const links = getAllLinks(playbook, spec).filter(
    (link) => playbook.workflow[link.target],
  );
  const issues = getAllIssues(playbook, spec);
  const incoming: Record<string, Link[]> = {};
  for (const link of links) (incoming[link.target] ??= []).push(link);

  // Left to right by source position, so the spread arrows do not cross.
  for (const siblings of Object.values(incoming))
    siblings.sort(
      (a, b) => (positions[a.source]?.x ?? 0) - (positions[b.source]?.x ?? 0),
    );

  const edges = links.map((link): GraphEdge => {
    const siblings = incoming[link.target];
    if (siblings.length < 2) return toEdge(link);
    const index = siblings.indexOf(link);
    return { ...toEdge(link), targetHandle: toIncomingHandleId(index) };
  });

  const nodes = Object.entries(playbook.workflow).map(
    ([id, step]): GraphNode => ({
      id,
      type: "step",
      position: positions[id] ?? { x: 0, y: 0 },
      data: getNodeData(
        step,
        spec,
        issues.filter((issue) => issue.ownerId === id),
        incoming[id]?.length ?? 0,
        readOnly,
      ),
    }),
  );

  return { nodes, edges };
};
