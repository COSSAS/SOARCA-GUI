import { describe, expect, it } from "vitest";

import type { Playbook } from "@/types";

import {
  getStoredPosition,
  LAYOUT_EXTENSION_ID,
  setPositions,
} from "./coordinates";
import {
  connect,
  disconnect,
  disconnectAll,
  duplicateStep,
  removeSteps,
} from "./edits";
import { getAllLinks, getPorts, playbookToGraph } from "./graph";
import { autoLayout, countCrossings, getPositions } from "./layout";
import { cacao20 } from "./specs/cacao-2.0";

const mockPlaybooks = import.meta.glob<Playbook>("/mock-playbooks/*.json", {
  eager: true,
  import: "default",
});

const branching: Playbook = {
  type: "playbook",
  spec_version: "cacao-2.0",
  id: "playbook--1",
  name: "Branching",
  created: "2024-01-01T00:00:00Z",
  modified: "2024-01-01T00:00:00Z",
  created_by: "identity--1",
  workflow_start: "start--1",
  workflow: {
    "start--1": { type: "start", on_completion: "if-condition--1" },
    "if-condition--1": {
      type: "if-condition",
      condition: "a = b",
      on_true: "switch-condition--1",
      on_false: "parallel--1",
      on_completion: "end--1",
    },
    "switch-condition--1": {
      type: "switch-condition",
      switch: "x",
      cases: { one: "action--1", default: "end--2" },
    },
    "parallel--1": {
      type: "parallel",
      next_steps: ["action--1", "while-condition--1"],
    },
    "while-condition--1": {
      type: "while-condition",
      condition: "y",
      on_true: "end--2",
    },
    "action--1": {
      type: "action",
      agent: "soarca",
      commands: [{ type: "manual", command: "do it" }],
      on_success: "end--2",
      on_failure: "end--1",
      step_extensions: { "extension-definition--x": { keep: true } },
    },
    "end--1": { type: "end" },
    "end--2": { type: "end" },
  },
};

const playbooks: [string, Playbook][] = [
  ...Object.entries(mockPlaybooks),
  ["branching", branching],
];

describe("graph round trip", () => {
  it.each(playbooks)("%s: an edge for every link", (_, playbook) => {
    const { nodes, edges } = playbookToGraph(
      playbook,
      cacao20,
      getPositions(playbook, cacao20),
    );
    expect(nodes).toHaveLength(Object.keys(playbook.workflow).length);
    expect(edges).toHaveLength(getAllLinks(playbook, cacao20).length);
    expect(new Set(edges.map((edge) => edge.id)).size).toBe(edges.length);
  });

  it("spreads arrows that end at the same step, left to right by source", () => {
    const positions = {
      ...getPositions(branching, cacao20),
      "switch-condition--1": { x: 300, y: 0 },
      "parallel--1": { x: -300, y: 0 },
    };
    const { nodes, edges } = playbookToGraph(branching, cacao20, positions);
    const into = edges.filter((edge) => edge.target === "action--1");
    expect(
      Object.fromEntries(into.map((edge) => [edge.source, edge.targetHandle])),
    ).toEqual({ "parallel--1": "in::0", "switch-condition--1": "in::1" });
    expect(nodes.find((node) => node.id === "action--1")?.data.incoming).toBe(2);
    expect(
      edges.find((edge) => edge.target === "while-condition--1")?.targetHandle,
    ).toBeUndefined();
  });

  it("keeps the node data of steps an edit did not change", () => {
    const toData = (playbook: Playbook) =>
      Object.fromEntries(
        playbookToGraph(playbook, cacao20, getPositions(playbook, cacao20))
          .nodes.map((node) => [node.id, node.data]),
      );
    const before = toData(branching);
    const after = toData(
      setPositions(branching, { "action--1": { x: 500, y: 500 } }),
    );
    const { "action--1": moved, ...unchanged } = after;
    expect(moved).not.toBe(before["action--1"]);
    for (const [id, data] of Object.entries(unchanged))
      expect(data).toBe(before[id]);
  });

  it.each(playbooks)(
    "%s: removing and re-adding every link gives the same playbook",
    (_, playbook) => {
      const links = getAllLinks(playbook, cacao20);
      const empty = links.reduce(disconnect, playbook);
      expect(getAllLinks(empty, cacao20)).toHaveLength(0);
      expect(links.reduce(connect, empty)).toEqual(playbook);
    },
  );
});

describe("getPorts", () => {
  it("shows only linked ports on a read-only step", () => {
    const data = {
      step: branching.workflow["switch-condition--1"],
      definition: cacao20.stepTypes["switch-condition"],
      blocked: [],
    };
    const labels = (readOnly: boolean) =>
      getPorts({ ...data, readOnly }).map((port) => port.label);
    expect(labels(false)).toEqual([
      "one",
      "default",
      "+ case",
      "next",
      "success",
      "failure",
    ]);
    expect(labels(true)).toEqual(["one", "default"]);
  });
});

describe("removeSteps", () => {
  it("removes the links pointing to the step", () => {
    const result = removeSteps(branching, ["action--1"]);
    expect(result.workflow["action--1"]).toBeUndefined();
    expect(result.workflow["switch-condition--1"].cases).toEqual({
      default: "end--2",
    });
    expect(result.workflow["parallel--1"].next_steps).toEqual([
      "while-condition--1",
    ]);
  });

  it("clears workflow_start when the start step is removed", () => {
    expect(removeSteps(branching, ["start--1"]).workflow_start).toBe("");
  });

  it("removes a group and all links to its members in one edit", () => {
    const result = removeSteps(branching, ["action--1", "end--2"]);

    expect(result.workflow["action--1"]).toBeUndefined();
    expect(result.workflow["end--2"]).toBeUndefined();
    expect(
      getAllLinks(result, cacao20).some(
        (link) =>
          link.source === "action--1" ||
          link.target === "action--1" ||
          link.source === "end--2" ||
          link.target === "end--2",
      ),
    ).toBe(false);
    expect(result.workflow["end--1"]).toEqual({ type: "end" });
  });
});

describe("step actions", () => {
  it("duplicates a step with its outgoing links and independent layout", () => {
    const source = {
      ...branching,
      workflow: {
        ...branching.workflow,
        "action--1": { ...branching.workflow["action--1"], uuid: "uuid-source" },
      },
    };
    const result = duplicateStep(
      source,
      "action--1",
      "action--copy",
      "uuid-copy",
      { x: 400, y: 300 },
    );
    const duplicate = result.workflow["action--copy"];

    expect(duplicate).toMatchObject({
      type: "action",
      name: "Action (copy)",
      agent: "soarca",
      uuid: "uuid-copy",
      on_success: "end--2",
      on_failure: "end--1",
    });
    expect(duplicate.step_extensions?.["extension-definition--x"]).toEqual({
      keep: true,
    });
    expect(source.workflow["action--1"].uuid).toBe("uuid-source");
    expect(getStoredPosition(duplicate)).toEqual({ x: 400, y: 300 });
    expect(getAllLinks(result, cacao20).filter((link) => link.source === "action--copy"))
      .toHaveLength(2);
  });

  it("disconnects all links to and from a step without removing the step", () => {
    const result = disconnectAll(branching, "action--1", cacao20);

    expect(result.workflow["action--1"]).toBeDefined();
    expect(
      getAllLinks(result, cacao20).filter(
        (link) => link.source === "action--1" || link.target === "action--1",
      ),
    ).toHaveLength(0);
    expect(result.workflow["switch-condition--1"].cases).toEqual({
      default: "end--2",
    });
  });

  it("does not duplicate a second start step", () => {
    expect(
      duplicateStep(
        branching,
        "start--1",
        "start--copy",
        "uuid-copy",
        { x: 400, y: 300 },
      ),
    ).toBe(branching);
  });
});

describe("layout", () => {
  it("stores midpoints in the CACAO Layout extension shape", () => {
    const result = setPositions(branching, { "end--1": { x: 10.4, y: -20.6 } });
    expect(result.workflow["end--1"].step_extensions).toEqual({
      [LAYOUT_EXTENSION_ID]: {
        type: "layout",
        coordinates: { x: 10, y: -21, outgoing_connections: [] },
      },
    });
    expect(getStoredPosition(result.workflow["end--1"])).toEqual({
      x: 10,
      y: -21,
    });
    expect(result.extension_definitions?.[LAYOUT_EXTENSION_ID]?.name).toBe(
      "CACAO Layout",
    );
  });

  // Only the real playbooks: "branching" is tangled on purpose and still gets crossings.
  it.each(Object.entries(mockPlaybooks))(
    "%s: auto layout has no crossing edges",
    (_, playbook) => {
      const positions = autoLayout(playbook, cacao20);
      expect(countCrossings(playbook, cacao20, positions)).toBe(0);
    },
  );
});
