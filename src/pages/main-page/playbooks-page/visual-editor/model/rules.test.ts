import { describe, expect, it } from "vitest";

import type { Playbook } from "@/types";

import {
  canAddStep,
  canConnect,
  findSaveBlocker,
  getAllIssues,
  getConnectTargets,
  getStepIssues,
} from "./rules";
import { cacao20 } from "./specs/cacao-2.0";

const playbook = {
  workflow: {
    "start--1": { type: "start", on_completion: "action--1" },
    "action--1": { type: "action", agent: "soarca", on_completion: "end--1" },
    "end--1": { type: "end" },
  },
} as unknown as Playbook;

describe("canConnect", () => {
  it("allows a valid link", () => {
    expect(
      canConnect(playbook, cacao20, {
        source: "action--1",
        kind: "on_completion",
        target: "end--1",
      }),
    ).toBe(true);
  });

  it.each([
    ["to itself", "action--1", "on_completion", "action--1"],
    ["into the start step", "action--1", "on_completion", "start--1"],
    ["from an end step", "end--1", "on_completion", "action--1"],
    ["on_success next to on_completion", "action--1", "on_success", "end--1"],
    ["on_failure from a start step", "start--1", "on_failure", "end--1"],
  ] as const)("blocks a link %s", (_, source, kind, target) => {
    expect(canConnect(playbook, cacao20, { source, kind, target })).toBe(false);
  });
});

describe("canAddStep", () => {
  it("allows only one start step", () => {
    expect(canAddStep(playbook, "start")).toBe(false);
    expect(canAddStep(playbook, "action")).toBe(true);
  });
});

describe("getConnectTargets", () => {
  it("offers only valid new destinations for a port", () => {
    expect(
      getConnectTargets(playbook, cacao20, "action--1", "on_completion"),
    ).toEqual([]);
    expect(
      getConnectTargets(playbook, cacao20, "action--1", "on_success"),
    ).toEqual([]);
  });

  it("lets a switch case be redirected to another non-start step", () => {
    const switchPlaybook = {
      ...playbook,
      workflow: {
        ...playbook.workflow,
        "switch--1": {
          type: "switch-condition",
          cases: { suspicious: "end--1" },
          switch: "score",
        },
        "end--2": { type: "end" },
      },
    } as Playbook;

    expect(
      getConnectTargets(switchPlaybook, cacao20, "switch--1", "cases", "suspicious"),
    ).toEqual(["action--1", "end--2"]);
  });
});

describe("getStepIssues", () => {
  const issuesOf = (step: Record<string, unknown>) =>
    getStepIssues(step as never, cacao20.stepTypes[step.type as string], cacao20);

  it("reports missing required fields as blocking and missing links as warnings", () => {
    expect(issuesOf({ type: "parallel", next_steps: ["end--1"] })).toEqual([
      { message: 'Needs at least 2 "branches" connections', blocking: false },
    ]);
    expect(issuesOf({ type: "action" })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "agent", tab: "details", blocking: true }),
        expect.objectContaining({ field: "commands", tab: "details", blocking: true }),
      ]),
    );
  });

  it("checks required fields inside each command", () => {
    const step = {
      type: "action",
      agent: "soarca",
      on_completion: "end--1",
      commands: [{ type: "manual" }, { type: "bash", command_b64: "bHM=" }],
    };
    expect(issuesOf(step)).toEqual([
      expect.objectContaining({ field: "commands.0.command", blocking: true }),
    ]);
  });
});

describe("findSaveBlocker", () => {
  const complete = {
    ...playbook,
    name: "Example",
    created_by: "identity--1",
    workflow_start: "start--1",
    workflow: {
      ...playbook.workflow,
      "action--1": {
        type: "action",
        agent: "soarca",
        commands: [{ type: "manual", command: "Check the host" }],
        on_completion: "end--1",
      },
    },
  } as Playbook;

  it("allows saving with only warnings", () => {
    const withWarning = {
      ...complete,
      workflow: { ...complete.workflow, "parallel--1": { type: "parallel" } },
    } as Playbook;
    expect(findSaveBlocker(getAllIssues(withWarning, cacao20), [])).toBeUndefined();
  });

  it("points at the first missing required field", () => {
    const unnamed = { ...complete, name: "" };
    expect(findSaveBlocker(getAllIssues(unnamed, cacao20), [])).toEqual(
      expect.objectContaining({ ownerId: "playbook", tab: "metadata", field: "name" }),
    );

    const noAgent = {
      ...complete,
      workflow: { ...complete.workflow, "action--1": { type: "action" } },
    } as Playbook;
    expect(findSaveBlocker(getAllIssues(noAgent, cacao20), [])).toEqual(
      expect.objectContaining({ ownerId: "action--1", field: "agent" }),
    );
  });

  it("blocks saving while a JSON box has invalid JSON", () => {
    expect(
      findSaveBlocker(getAllIssues(complete, cacao20), [
        { ownerId: "action--1", tab: "advanced" },
      ]),
    ).toEqual({ ownerId: "action--1", tab: "advanced", message: "Fix the invalid JSON" });
  });
});
