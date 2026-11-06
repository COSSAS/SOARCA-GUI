import { describe, expect, it } from "vitest";

import type { Playbook, Step } from "@/types";

import { LAYOUT_EXTENSION_ID } from "./coordinates";
import {
  getExtraFields,
  getExtraStepFields,
  getOwnedPlaybookKeys,
  getOwnedStepKeys,
  setExtraFields,
  setExtraStepFields,
  setField,
} from "./fields";
import { cacao20 } from "./specs/cacao-2.0";

describe("setField", () => {
  it("keeps the other fields and removes cleared ones", () => {
    const step = { type: "action", name: "Scan", custom_field: 1 } as Step;

    expect(setField(step, "description", "Runs a scan")).toEqual({
      ...step,
      description: "Runs a scan",
    });
    expect(setField(step, "name", "  ")).toEqual({
      type: "action",
      custom_field: 1,
    });
    expect(setField(step, "custom_field", [])).toEqual({
      type: "action",
      name: "Scan",
    });
  });
});

describe("JSON box of a step", () => {
  const owned = getOwnedStepKeys(cacao20, cacao20.stepTypes.action);
  const layout = { x: 10, y: 20 };
  const step = {
    type: "action",
    name: "Scan",
    on_completion: "end--1",
    x_vendor: { a: 1 },
    step_extensions: { [LAYOUT_EXTENSION_ID]: layout, "extension--1": {} },
  } as unknown as Step;

  it("shows only the fields without a form input, without the layout", () => {
    expect(getExtraStepFields(step, owned)).toEqual({
      x_vendor: { a: 1 },
      step_extensions: { "extension--1": {} },
    });
  });

  it("does not lose form fields, connections or layout when the JSON changes", () => {
    expect(setExtraStepFields(step, owned, {})).toEqual({
      type: "action",
      name: "Scan",
      on_completion: "end--1",
      step_extensions: { [LAYOUT_EXTENSION_ID]: layout },
    });
  });
});

describe("JSON box of the playbook", () => {
  it("cannot change protected fields, the creator or the workflow", () => {
    const owned = getOwnedPlaybookKeys(cacao20);
    const playbook = {
      id: "playbook--1",
      created_by: "identity--1",
      name: "Example",
      workflow: {},
      x_note: "keep me editable",
    } as unknown as Playbook;

    expect(getExtraFields(playbook, owned)).toEqual({
      x_note: "keep me editable",
    });
    expect(
      setExtraFields(playbook, owned, {
        id: "playbook--2",
        created_by: "identity--2",
        workflow: { a: 1 },
      }),
    ).toEqual({
      id: "playbook--1",
      created_by: "identity--1",
      name: "Example",
      workflow: {},
    });
  });
});
