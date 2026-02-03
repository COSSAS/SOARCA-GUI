import { Playbook, Step } from "@/types";
import { describe, expect, test } from "vitest";
import {
  generatePlaybookFilename,
  getOrderedSteps,
  validatePlaybookJson,
} from "./utils";

describe("Playbook utilities", () => {
  test("validatePlaybookJson returns valid for correct playbook structure", () => {
    const validPlaybook = JSON.stringify({
      type: "playbook",
      id: "playbook--test-123",
      name: "Test Playbook",
      spec_version: "cacao-2.0",
      workflow_start: "step-1",
      workflow: {
        "step-1": {
          type: "action",
          name: "First Step",
        },
      },
    });

    const result = validatePlaybookJson(validPlaybook);
    expect(result.valid).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  test("validatePlaybookJson returns error for empty content", () => {
    const result = validatePlaybookJson("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("JSON content cannot be empty");
  });

  test("validatePlaybookJson returns error for whitespace only content", () => {
    const result = validatePlaybookJson("   ");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("JSON content cannot be empty");
  });

  test("validatePlaybookJson returns error for invalid JSON", () => {
    const result = validatePlaybookJson("{ invalid json");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid JSON:");
  });

  test("validatePlaybookJson returns error when type is not 'playbook'", () => {
    const invalidPlaybook = JSON.stringify({
      type: "not-playbook",
      id: "test",
      name: "Test",
      spec_version: "cacao-2.0",
      workflow_start: "step-1",
      workflow: {},
    });

    const result = validatePlaybookJson(invalidPlaybook);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid playbook: type must be 'playbook'");
  });

  test("validatePlaybookJson returns error when id is missing", () => {
    const invalidPlaybook = JSON.stringify({
      type: "playbook",
      name: "Test",
      spec_version: "cacao-2.0",
      workflow_start: "step-1",
      workflow: {},
    });

    const result = validatePlaybookJson(invalidPlaybook);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid playbook: missing 'id' field");
  });

  test("validatePlaybookJson returns error when name is missing", () => {
    const invalidPlaybook = JSON.stringify({
      type: "playbook",
      id: "test",
      spec_version: "cacao-2.0",
      workflow_start: "step-1",
      workflow: {},
    });

    const result = validatePlaybookJson(invalidPlaybook);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid playbook: missing 'name' field");
  });

  test("validatePlaybookJson returns error when spec_version is missing", () => {
    const invalidPlaybook = JSON.stringify({
      type: "playbook",
      id: "test",
      name: "Test",
      workflow_start: "step-1",
      workflow: {},
    });

    const result = validatePlaybookJson(invalidPlaybook);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invalid playbook: missing 'spec_version' field");
  });

  test("validatePlaybookJson returns error when workflow_start is missing", () => {
    const invalidPlaybook = JSON.stringify({
      type: "playbook",
      id: "test",
      name: "Test",
      spec_version: "cacao-2.0",
      workflow: {},
    });

    const result = validatePlaybookJson(invalidPlaybook);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Invalid playbook: missing 'workflow_start' field",
    );
  });

  test("validatePlaybookJson returns error when workflow is missing", () => {
    const invalidPlaybook = JSON.stringify({
      type: "playbook",
      id: "test",
      name: "Test",
      spec_version: "cacao-2.0",
      workflow_start: "step-1",
    });

    const result = validatePlaybookJson(invalidPlaybook);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Invalid playbook: missing or invalid 'workflow' field",
    );
  });

  test("validatePlaybookJson returns error when workflow is not an object", () => {
    const invalidPlaybook = JSON.stringify({
      type: "playbook",
      id: "test",
      name: "Test",
      spec_version: "cacao-2.0",
      workflow_start: "step-1",
      workflow: "not-an-object",
    });

    const result = validatePlaybookJson(invalidPlaybook);
    expect(result.valid).toBe(false);
    expect(result.error).toBe(
      "Invalid playbook: missing or invalid 'workflow' field",
    );
  });

  test("getOrderedSteps returns steps in linear order following on_completion", () => {
    const workflow: Record<string, Step> = {
      "step-1": {
        type: "action",
        name: "First",
        on_completion: "step-2",
      } as Step,
      "step-2": {
        type: "action",
        name: "Second",
        on_completion: "step-3",
      } as Step,
      "step-3": {
        type: "action",
        name: "Third",
      } as Step,
    };

    const ordered = getOrderedSteps(workflow, "step-1");
    expect(ordered.length).toBe(3);
    expect(ordered[0].id).toBe("step-1");
    expect(ordered[1].id).toBe("step-2");
    expect(ordered[2].id).toBe("step-3");
  });

  test("getOrderedSteps follows on_success when on_completion is not present", () => {
    const workflow: Record<string, Step> = {
      "step-1": {
        type: "action",
        name: "First",
        on_success: "step-2",
      } as Step,
      "step-2": {
        type: "action",
        name: "Second",
      } as Step,
    };

    const ordered = getOrderedSteps(workflow, "step-1");
    expect(ordered.length).toBe(2);
    expect(ordered[0].id).toBe("step-1");
    expect(ordered[1].id).toBe("step-2");
  });

  test("getOrderedSteps follows on_true when other transitions are not present", () => {
    const workflow: Record<string, Step> = {
      "step-1": {
        type: "if-condition",
        name: "Condition",
        on_true: "step-2",
      } as Step,
      "step-2": {
        type: "action",
        name: "Second",
      } as Step,
    };

    const ordered = getOrderedSteps(workflow, "step-1");
    expect(ordered.length).toBe(2);
    expect(ordered[0].id).toBe("step-1");
    expect(ordered[1].id).toBe("step-2");
  });

  test("getOrderedSteps follows first next_step when other transitions are not present", () => {
    const workflow: Record<string, Step> = {
      "step-1": {
        type: "parallel",
        name: "Parallel",
        next_steps: ["step-2", "step-3"],
      } as Step,
      "step-2": {
        type: "action",
        name: "Second",
      } as Step,
      "step-3": {
        type: "action",
        name: "Third",
      } as Step,
    };

    const ordered = getOrderedSteps(workflow, "step-1");
    expect(ordered.length).toBe(2);
    expect(ordered[0].id).toBe("step-1");
    expect(ordered[1].id).toBe("step-2");
  });

  test("getOrderedSteps stops when reaching a step with no next transition", () => {
    const workflow: Record<string, Step> = {
      "step-1": {
        type: "action",
        name: "First",
        on_completion: "step-2",
      } as Step,
      "step-2": {
        type: "end",
        name: "End",
      } as Step,
    };

    const ordered = getOrderedSteps(workflow, "step-1");
    expect(ordered.length).toBe(2);
    expect(ordered[0].id).toBe("step-1");
    expect(ordered[1].id).toBe("step-2");
  });

  test("getOrderedSteps prevents infinite loops by tracking visited steps", () => {
    const workflow: Record<string, Step> = {
      "step-1": {
        type: "action",
        name: "First",
        on_completion: "step-2",
      } as Step,
      "step-2": {
        type: "action",
        name: "Second",
        on_completion: "step-1", // Loop back
      } as Step,
    };

    const ordered = getOrderedSteps(workflow, "step-1");
    expect(ordered.length).toBe(2); // Should stop after visiting both once
    expect(ordered[0].id).toBe("step-1");
    expect(ordered[1].id).toBe("step-2");
  });

  test("getOrderedSteps returns empty array when workflow_start step does not exist", () => {
    const workflow: Record<string, Step> = {
      "step-1": {
        type: "action",
        name: "First",
      } as Step,
    };

    const ordered = getOrderedSteps(workflow, "nonexistent-step");
    expect(ordered.length).toBe(0);
  });

  test("getOrderedSteps handles single step workflow", () => {
    const workflow: Record<string, Step> = {
      "step-1": {
        type: "action",
        name: "Only Step",
      } as Step,
    };

    const ordered = getOrderedSteps(workflow, "step-1");
    expect(ordered.length).toBe(1);
    expect(ordered[0].id).toBe("step-1");
  });

  test("generatePlaybookFilename creates correct filename format", () => {
    const playbook: Partial<Playbook> = {
      type: "playbook",
      id: "playbook--test-123",
      name: "Test Playbook",
      spec_version: "cacao-2.0",
      modified: "2024-01-15T10:30:45.123Z",
      workflow_start: "step-1",
      workflow: {},
    };

    const filename = generatePlaybookFilename(playbook as Playbook);
    expect(filename).toContain("playbook--test-123");
    expect(filename).toContain("2024-01-15");
    expect(filename).toMatch(/\.json$/);
    // Verify colons and periods are replaced with hyphens
    expect(filename).not.toContain(":");
    expect(filename).toMatch(
      /playbook--test-123-2024-01-15T\d{2}-\d{2}-\d{2}-\d{3}Z\.json/,
    );
  });

  test("generatePlaybookFilename uses current date when modified is not present", () => {
    const playbook: Partial<Playbook> = {
      type: "playbook",
      id: "playbook--test-456",
      name: "Test Playbook",
      spec_version: "cacao-2.0",
      workflow_start: "step-1",
      workflow: {},
    };

    const filename = generatePlaybookFilename(playbook as Playbook);
    expect(filename).toContain("playbook--test-456");
    expect(filename).toMatch(/\.json$/);
    // Should contain current year
    const currentYear = new Date().getFullYear();
    expect(filename).toContain(String(currentYear));
  });
});
