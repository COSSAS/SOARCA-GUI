import type { Playbook, Step } from "@/types";

import { setPositions, type Position } from "./coordinates";
import { getAllLinks, type Link } from "./rules";
import type { CacaoSpec, SingleConnection } from "./specs";

// Every edit returns a new playbook and keeps all fields it does not touch.

const SINGLE_CONNECTIONS: SingleConnection[] = [
  "on_completion",
  "on_success",
  "on_failure",
  "on_true",
  "on_false",
];

export const newStepId = (type: string) => `${type}--${crypto.randomUUID()}`;

/** A playbook with a start step linked to an end step. */
export const createEmptyPlaybook = (specVersion: string): Playbook => {
  const now = new Date().toISOString();
  const startId = newStepId("start");
  const endId = newStepId("end");
  const playbook: Playbook = {
    type: "playbook",
    spec_version: specVersion,
    id: `playbook--${crypto.randomUUID()}`,
    name: "New playbook",
    created: now,
    modified: now,
    created_by: `identity--${crypto.randomUUID()}`,
    workflow_start: startId,
    workflow: {
      [startId]: { type: "start", name: "Start", on_completion: endId },
      [endId]: { type: "end", name: "End" },
    },
  };
  return setPositions(playbook, {
    [startId]: { x: 0, y: 0 },
    [endId]: { x: 0, y: 200 },
  });
};

const nextCaseKey = (cases: Record<string, string>) => {
  let index = Object.keys(cases).length + 1;
  while (`case-${index}` in cases) index++;
  return `case-${index}`;
};

export const updateStep = (
  playbook: Playbook,
  stepId: string,
  step: Step,
): Playbook => ({
  ...playbook,
  workflow: { ...playbook.workflow, [stepId]: step },
});

/** Points `kind` of the source step at the target. A link without a case key adds a new case. */
export const connect = (playbook: Playbook, link: Link): Playbook => {
  const step = playbook.workflow[link.source];
  if (!step) return playbook;

  if (link.kind === "cases") {
    const cases = { ...step.cases };
    cases[link.key ?? nextCaseKey(cases)] = link.target;
    return updateStep(playbook, link.source, { ...step, cases });
  }
  if (link.kind === "next_steps") {
    const nextSteps = step.next_steps ?? [];
    if (nextSteps.includes(link.target)) return playbook;
    return updateStep(playbook, link.source, {
      ...step,
      next_steps: [...nextSteps, link.target],
    });
  }
  return updateStep(playbook, link.source, {
    ...step,
    [link.kind]: link.target,
  });
};

/** Copies the step with a new `cases` or `next_steps`, leaving the key out when it is empty. */
const setList = <K extends "cases" | "next_steps">(
  step: Step,
  key: K,
  value: NonNullable<Step[K]>,
): Step => {
  const next: Step = { ...step, [key]: value };
  if (!Object.keys(value).length) delete next[key];
  return next;
};

/** Removes one link. A switch case without a target cannot exist, so its key is removed too. */
export const disconnect = (playbook: Playbook, link: Link): Playbook => {
  const step = playbook.workflow[link.source];
  if (!step) return playbook;

  let next: Step;
  if (link.kind === "cases") {
    const cases = { ...step.cases };
    if (link.key !== undefined) delete cases[link.key];
    next = setList(step, "cases", cases);
  } else if (link.kind === "next_steps") {
    const nextSteps = (step.next_steps ?? []).filter((t) => t !== link.target);
    next = setList(step, "next_steps", nextSteps);
  } else {
    next = { ...step };
    delete next[link.kind];
  }
  return updateStep(playbook, link.source, next);
};

export const renameCase = (
  playbook: Playbook,
  stepId: string,
  oldKey: string,
  newKey: string,
): Playbook => {
  const step = playbook.workflow[stepId];
  if (!step?.cases || !(oldKey in step.cases) || newKey in step.cases)
    return playbook;
  // Rebuild to keep the case order.
  const cases = Object.fromEntries(
    Object.entries(step.cases).map(([key, target]) => [
      key === oldKey ? newKey : key,
      target,
    ]),
  );
  return updateStep(playbook, stepId, { ...step, cases });
};

export const addStep = (
  playbook: Playbook,
  stepId: string,
  step: Step,
  position: Position,
): Playbook => {
  const withStep = updateStep(playbook, stepId, step);
  return setPositions(
    step.type === "start" ? { ...withStep, workflow_start: stepId } : withStep,
    { [stepId]: position },
  );
};

/** Copies a step and its outgoing links under a new ID at a separate position. */
export const duplicateStep = (
  playbook: Playbook,
  stepId: string,
  newId: string,
  newUuid: string,
  position: Position,
): Playbook => {
  const source = playbook.workflow[stepId];
  if (!source || source.type === "start" || playbook.workflow[newId])
    return playbook;

  const duplicate: Step = structuredClone(source);
  const typeLabel = source.type
    .replaceAll("-", " ")
    .replace(/^./, (character) => character.toUpperCase());
  duplicate.name = `${source.name ?? typeLabel} (copy)`;
  if (source.uuid) duplicate.uuid = newUuid;

  return setPositions(
    {
      ...playbook,
      workflow: { ...playbook.workflow, [newId]: duplicate },
    },
    { [newId]: position },
  );
};

/** Removes every incoming and outgoing connection while keeping the step itself. */
export const disconnectAll = (
  playbook: Playbook,
  stepId: string,
  spec: CacaoSpec,
): Playbook =>
  getAllLinks(playbook, spec)
    .filter((link) => link.source === stepId || link.target === stepId)
    .reduce(disconnect, playbook);

/** Removes every link from `step` to any of the `targets`. */
const unlinkTargets = (step: Step, targets: Set<string>): Step => {
  let next: Step = { ...step };
  for (const kind of SINGLE_CONNECTIONS)
    if (next[kind] && targets.has(next[kind])) delete next[kind];

  if (step.cases && Object.values(step.cases).some((t) => targets.has(t))) {
    const cases = Object.fromEntries(
      Object.entries(step.cases).filter(([, t]) => !targets.has(t)),
    );
    next = setList(next, "cases", cases);
  }
  if (step.next_steps?.some((t) => targets.has(t))) {
    const nextSteps = step.next_steps.filter((t) => !targets.has(t));
    next = setList(next, "next_steps", nextSteps);
  }
  return next;
};

/** Removes steps and every link pointing to any of them. */
export const removeSteps = (
  playbook: Playbook,
  stepIds: string[],
): Playbook => {
  const removed = new Set(stepIds);
  const workflow = Object.fromEntries(
    Object.entries(playbook.workflow)
      .filter(([id]) => !removed.has(id))
      .map(([id, step]) => [id, unlinkTargets(step, removed)]),
  );
  return {
    ...playbook,
    workflow,
    workflow_start: removed.has(playbook.workflow_start)
      ? ""
      : playbook.workflow_start,
  };
};
