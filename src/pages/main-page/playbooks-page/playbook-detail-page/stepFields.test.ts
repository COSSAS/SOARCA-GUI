import { describe, expect, it } from "vitest";

import type { Playbook, Step } from "@/types";

import { getStepDetails, readContent, readText } from "./stepFields";

describe("getStepDetails", () => {
  const playbook = { spec_version: "cacao-2.0" } as Playbook;

  it("lists spec fields with their labels, then other fields, and leaves out the rest", () => {
    const step = {
      type: "action",
      name: "Scan",
      description: "Runs a scan",
      x_vendor: "acme",
      agent: "soarca--1",
      timeout: 500,
      on_completion: "end--1",
      commands: [],
    } as unknown as Step;

    const { typeLabel, details } = getStepDetails(step, playbook);

    expect(typeLabel).toBe("Action");
    expect(details).toEqual([
      { key: "timeout", label: "Timeout (ms)", value: 500 },
      { key: "agent", label: "Agent", value: "soarca--1" },
      { key: "x_vendor", label: "X vendor", value: "acme" },
    ]);
  });

  it("falls back to the raw type and key names for an unknown spec version", () => {
    const step = { type: "custom", out_args: ["a"] } as unknown as Step;

    expect(getStepDetails(step, { spec_version: "cacao-9" } as Playbook)).toEqual({
      typeLabel: "custom",
      details: [{ key: "out_args", label: "Out args", value: ["a"] }],
    });
  });
});

describe("readText", () => {
  it("prefers the plain value and otherwise decodes base64", () => {
    expect(readText("ls", btoa("pwd"))).toEqual({ text: "ls", decoded: false });
    expect(readText(undefined, btoa("pwd"))).toEqual({ text: "pwd", decoded: true });
    expect(readText()).toBeUndefined();
  });
});

describe("readContent", () => {
  it("pretty-prints valid JSON", () => {
    expect(readContent('{"a":1}')).toEqual({ code: '{\n  "a": 1\n}', invalid: false });
  });

  it("flags JSON-like text that does not parse and leaves it as written", () => {
    const text = '{"severity":__severity__:value}';
    expect(readContent(text)).toEqual({ code: text, invalid: true });
  });

  it("does not flag text that is not meant to be JSON", () => {
    expect(readContent("name=value")).toEqual({ code: "name=value", invalid: false });
  });
});
