import { Graph, layout } from "@dagrejs/dagre";

import type { Playbook } from "@/types";

import { getStoredPosition, type Position } from "./coordinates";
import { getPorts, toHandleId } from "./graph";
import { getAllLinks, getBlockedConnections, getLinks } from "./rules";
import type { CacaoSpec } from "./specs";

export const NODE_WIDTH = 240;
export const NODE_HEIGHT = 96;
export const NODE_GAP = 48;
export const RANK_GAP = 72;
/** Room for each port badge, so badges never overlap. */
export const PORT_GAP = 72;

export type Size = { width: number; height: number };

/** Steps grow wider when they have many ports, e.g. a switch with many cases. */
export const getNodeWidth = (portCount: number) =>
  Math.max(NODE_WIDTH, (portCount + 1) * PORT_GAP);

/** Where the `index`-th of `count` evenly spread handles sits, as a fraction of the step width. */
export const spreadFraction = (index: number, count: number) =>
  (index + 1) / (count + 1);

const getEditPorts = (playbook: Playbook, spec: CacaoSpec, id: string) => {
  const step = playbook.workflow[id];
  return getPorts({
    step,
    definition: spec.stepTypes[step.type],
    blocked: getBlockedConnections(step, spec),
    readOnly: false,
  });
};

/**
 * Ports are drawn left to right (e.g. "true" before "false"), but dagre may place
 * their targets the other way round, so the edges cross. This reorders the targets
 * of each step that share a row by port order, reusing the same x values.
 */
const followPortOrder = (
  playbook: Playbook,
  spec: CacaoSpec,
  base: Record<string, Position>,
) => {
  const positions = structuredClone(base);
  for (const [id, step] of Object.entries(playbook.workflow)) {
    const targets = getLinks(id, step, spec.stepTypes[step.type])
      .map((link) => positions[link.target])
      .filter((position) => position !== undefined);
    for (const row of new Set(targets.map((target) => target.y))) {
      const inRow = [...new Set(targets.filter((target) => target.y === row))];
      const xs = inRow.map((target) => target.x).sort((a, b) => a - b);
      inRow.forEach((target, i) => (target.x = xs[i]));
    }
  }
  return positions;
};

const mirror = (positions: Record<string, Position>) =>
  Object.fromEntries(
    Object.entries(positions).map(([id, { x, y }]) => [id, { x: -x, y }]),
  );

type Segment = { to: string; a: Position; b: Position };

const side = (p: Position, q: Position, r: Position) =>
  Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));

const intersects = (s: Segment, t: Segment) =>
  side(s.a, s.b, t.a) * side(s.a, s.b, t.b) < 0 &&
  side(t.a, t.b, s.a) * side(t.a, t.b, s.b) < 0;

/** Counts crossing edges, drawn as straight lines from their port to their target. */
export const countCrossings = (
  playbook: Playbook,
  spec: CacaoSpec,
  positions: Record<string, Position>,
) => {
  const segments: Segment[] = getAllLinks(playbook, spec)
    .filter((link) => positions[link.source] && positions[link.target])
    .map((link) => {
      // Same spread as the badges on the card.
      const ports = getEditPorts(playbook, spec, link.source);
      const index = ports.findIndex(
        (port) => port.handleId === toHandleId(link.kind, link.key),
      );
      const port =
        (spreadFraction(index, ports.length) - 0.5) *
        getNodeWidth(ports.length);
      const source = positions[link.source];
      return {
        to: link.target,
        a: { x: source.x + port, y: source.y },
        b: positions[link.target],
      };
    });
  let crossings = 0;
  segments.forEach((s, i) =>
    segments.slice(i + 1).forEach((t) => {
      if (s.to !== t.to && intersects(s, t)) crossings++;
    }),
  );
  return crossings;
};

/** Top-to-bottom layout of all steps, as midpoints. Uses `sizes` where known. */
export const autoLayout = (
  playbook: Playbook,
  spec: CacaoSpec,
  sizes: Record<string, Size | undefined> = {},
): Record<string, Position> => {
  const graph = new Graph();
  graph.setGraph({ rankdir: "TB", nodesep: NODE_GAP, ranksep: RANK_GAP });
  graph.setDefaultEdgeLabel(() => ({}));

  for (const id of Object.keys(playbook.workflow))
    graph.setNode(
      id,
      sizes[id] ?? {
        width: getNodeWidth(getEditPorts(playbook, spec, id).length),
        height: NODE_HEIGHT,
      },
    );
  // Links come in port order, which helps dagre keep targets in that order.
  for (const link of getAllLinks(playbook, spec))
    if (playbook.workflow[link.target]) graph.setEdge(link.source, link.target);

  layout(graph);

  const positions = Object.fromEntries(
    graph.nodes().map((id) => {
      const { x, y } = graph.node(id);
      return [id, { x, y }];
    }),
  );

  // dagre does not know about ports, so try a few variants and keep the one with
  // the fewest crossings. Earlier entries win ties.
  const candidates = [positions, mirror(positions)].flatMap((variant) => [
    followPortOrder(playbook, spec, variant),
    variant,
  ]);
  const scored = candidates.map((candidate) => ({
    candidate,
    crossings: countCrossings(playbook, spec, candidate),
  }));
  return scored.reduce((best, next) =>
    next.crossings < best.crossings ? next : best,
  ).candidate;
};

/** The midpoint of a spot below the lowest step, for steps added with a click. */
export const findFreeSpot = (playbook: Playbook): Position => {
  const positions = Object.values(playbook.workflow)
    .map(getStoredPosition)
    .filter((position) => position !== undefined);
  if (!positions.length) return { x: 0, y: 0 };
  const lowest = positions.reduce((a, b) => (b.y > a.y ? b : a));
  return { x: lowest.x, y: lowest.y + NODE_HEIGHT + RANK_GAP };
};

/** Stored midpoints where present, auto layout for the rest. */
export const getPositions = (
  playbook: Playbook,
  spec: CacaoSpec,
): Record<string, Position> => {
  const steps = Object.entries(playbook.workflow);
  const stored = steps.flatMap(([id, step]) => {
    const position = getStoredPosition(step);
    return position ? [[id, position] as const] : [];
  });
  if (stored.length === steps.length) return Object.fromEntries(stored);
  return { ...autoLayout(playbook, spec), ...Object.fromEntries(stored) };
};
