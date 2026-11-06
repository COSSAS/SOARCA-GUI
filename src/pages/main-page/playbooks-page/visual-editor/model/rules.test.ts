import { describe, expect, it } from "vitest";

import type { Playbook } from "@/types";

import {
  canAddStep,
  canConnect,
  findSaveBlocker,
  getAllIssues,
  getConnectTargets,
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
  it("allows one start step and only step types SOARCA runs", () => {
    expect(canAddStep(playbook, "start")).toBe(false);
    expect(canAddStep(playbook, "action")).toBe(true);
    expect(canAddStep(playbook, "parallel")).toBe(false);
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
      getConnectTargets(
        switchPlaybook,
        cacao20,
        "switch--1",
        "cases",
        "suspicious",
      ),
    ).toEqual(["action--1", "end--2"]);
  });
});

describe("getAllIssues", () => {
  const action = {
    type: "action",
    agent: "soarca--1",
    commands: [{ type: "manual", command: "Check the host" }],
  };
  // Accepted by SOARCA as is.
  const valid = {
    name: "Example",
    created_by: "identity--1",
    workflow_start: "start--1",
    agent_definitions: {
      "soarca--1": { type: "soarca", name: "soarca-manual" },
    },
    workflow: {
      "start--1": { type: "start", on_completion: "action--1" },
      "action--1": { ...action, on_completion: "end--1" },
      "end--1": { type: "end" },
    },
  } as unknown as Playbook;
  const withSteps = (steps: Record<string, unknown>) =>
    ({ ...valid, workflow: { ...valid.workflow, ...steps } }) as Playbook;
  const blockerOf = (changed: Playbook) =>
    findSaveBlocker(getAllIssues(changed, cacao20), []);

  it("finds nothing in a playbook SOARCA accepts", () => {
    expect(getAllIssues(valid, cacao20)).toEqual([]);
  });

  it.each([
    [
      "an action without an agent",
      withSteps({ "action--1": { type: "action", on_completion: "end--1" } }),
      "action--1",
    ],
    [
      "an agent the playbook does not define",
      withSteps({
        "action--1": { ...action, agent: "soarca--2", on_completion: "end--1" },
      }),
      "action--1",
    ],
    [
      "an if condition without a true branch",
      withSteps({
        "if--1": {
          type: "if-condition",
          condition: "__a__:value = 1",
          on_false: "end--1",
        },
      }),
      "if--1",
    ],
    [
      "a step that leads nowhere",
      withSteps({ "action--2": action }),
      "action--2",
    ],
    [
      "a loop",
      withSteps({
        "action--1": { ...action, on_completion: "action--2" },
        "action--2": { ...action, on_completion: "action--1" },
      }),
      "action--2",
    ],
    [
      "a delay of 0",
      withSteps({
        "action--1": { ...action, delay: 0, on_completion: "end--1" },
      }),
      "action--1",
    ],
    [
      "a priority above 100",
      { ...valid, priority: 101 } as Playbook,
      "playbook",
    ],
    [
      "an ssh target without an address",
      {
        ...valid,
        target_definitions: { "ssh--1": { type: "ssh", name: "Host" } },
      } as Playbook,
      "playbook",
    ],
    [
      "a start step that does not exist",
      { ...valid, workflow_start: "start--2" },
      "playbook",
    ],
  ])("blocks saving %s, like SOARCA", (_, changed, ownerId) => {
    expect(blockerOf(changed)).toEqual(expect.objectContaining({ ownerId }));
  });

  it("only warns about what SOARCA accepts but cannot run", () => {
    const changed = withSteps({
      "action--1": {
        ...action,
        commands: [{ type: "ssh", command: "ls" }],
        on_completion: "end--1",
      },
      "if--1": { type: "if-condition", condition: "a == b", on_true: "end--1" },
      "parallel--1": { type: "parallel", next_steps: ["action--1", "end--1"] },
    });
    const issues = getAllIssues(changed, cacao20);
    expect(issues.map((issue) => issue.ownerId).sort()).toEqual([
      "action--1",
      "if--1",
      "parallel--1",
    ]);
    expect(findSaveBlocker(issues, [])).toBeUndefined();
  });

  it("checks required fields inside each command", () => {
    const changed = withSteps({
      "action--1": {
        ...action,
        commands: [{ type: "manual" }, { type: "manual", command_b64: "bHM=" }],
        on_completion: "end--1",
      },
    });
    expect(getAllIssues(changed, cacao20)).toEqual([
      expect.objectContaining({ field: "commands.0.command", blocking: true }),
    ]);
  });

  it("points the save blocker at the field", () => {
    expect(blockerOf({ ...valid, name: "" })).toEqual(
      expect.objectContaining({
        ownerId: "playbook",
        tab: "metadata",
        field: "name",
      }),
    );
  });

  it("blocks saving while a JSON box has invalid JSON", () => {
    expect(
      findSaveBlocker(getAllIssues(valid, cacao20), [
        { ownerId: "action--1", tab: "advanced" },
      ]),
    ).toEqual({
      ownerId: "action--1",
      tab: "advanced",
      message: "Fix the invalid JSON",
    });
  });
});
