import { Playbook, Step } from "@/types";

/**
 * Validates CACAO playbook JSON structure.
 * Returns validation result with error message if invalid.
 */
export const validatePlaybookJson = (
  content: string,
): { valid: boolean; data?: Playbook; error?: string } => {
  if (!content.trim()) {
    return { valid: false, error: "JSON content cannot be empty" };
  }

  try {
    const parsed = JSON.parse(content);

    // Basic CACAO playbook validation
    if (!parsed.type || parsed.type !== "playbook") {
      return {
        valid: false,
        error: "Invalid playbook: type must be 'playbook'",
      };
    }

    if (!parsed.id) {
      return { valid: false, error: "Invalid playbook: missing 'id' field" };
    }

    if (!parsed.name) {
      return {
        valid: false,
        error: "Invalid playbook: missing 'name' field",
      };
    }

    if (!parsed.spec_version) {
      return {
        valid: false,
        error: "Invalid playbook: missing 'spec_version' field",
      };
    }

    if (!parsed.workflow_start) {
      return {
        valid: false,
        error: "Invalid playbook: missing 'workflow_start' field",
      };
    }

    if (!parsed.workflow || typeof parsed.workflow !== "object") {
      return {
        valid: false,
        error: "Invalid playbook: missing or invalid 'workflow' field",
      };
    }

    return { valid: true, data: parsed as Playbook };
  } catch (err) {
    return {
      valid: false,
      error: `Invalid JSON: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
};

/**
 * Traverses workflow from start to build ordered list of steps.
 * Follows on_completion, on_success, on_true, or first next_step.
 */
export const getOrderedSteps = (
  workflow: Record<string, Step>,
  workflowStart: string,
): Array<Step & { id: string }> => {
  const steps: Array<Step & { id: string }> = [];
  let currentStepId: string | undefined = workflowStart;
  const visited = new Set<string>();

  while (currentStepId && !visited.has(currentStepId)) {
    visited.add(currentStepId);
    const step: Step = workflow[currentStepId];
    if (step) {
      steps.push({ ...step, id: currentStepId });

      // Determine next step
      if (step.on_completion) {
        currentStepId = step.on_completion;
      } else if (step.on_success) {
        currentStepId = step.on_success;
      } else if (step.on_true) {
        currentStepId = step.on_true;
      } else if (step.next_steps && step.next_steps.length > 0) {
        currentStepId = step.next_steps[0];
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return steps;
};

/**
 * Generates a safe filename for exporting a playbook.
 * Format: {id}-{modified-date}.json
 */
export const generatePlaybookFilename = (playbook: Playbook): string => {
  const date = new Date(playbook.modified || Date.now())
    .toISOString()
    .replace(/[:.]/g, "-");
  return `${playbook.id}-${date}.json`;
};
