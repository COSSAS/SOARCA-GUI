/**
 * What SOARCA can run, checked against SOARCA development (88cc9e6).
 * SOARCA cannot list its capabilities yet. When it can, fetch them in
 * useReferenceOptions instead of using this list.
 */
const SOARCA_STEP_TYPES = [
  "start",
  "end",
  "action",
  "playbook-action",
  "if-condition",
  "while-condition",
];

export const SOARCA_AGENT_TYPES = ["soarca"];

/** SOARCA picks the capability by the agent name. Each runs one command type. */
export const SOARCA_CAPABILITIES: Record<string, string> = {
  "soarca-manual": "manual",
  "soarca-ssh": "ssh",
  "soarca-http-api": "http-api",
  "soarca-powershell": "powershell",
  "soarca-openc2-http": "openc2-http",
};

export const isStepTypeSupported = (type: string) =>
  SOARCA_STEP_TYPES.includes(type);

const CONDITION_OPERATORS = ["=", "!=", ">", "<", "<=", ">=", "IN"];

/**
 * SOARCA splits a condition on single spaces and needs exactly
 * `left operator right`, e.g. `__status__:value = done`.
 */
export const isConditionSupported = (condition: string) => {
  const parts = condition.split(" ");
  return parts.length === 3 && CONDITION_OPERATORS.includes(parts[1]);
};

export const CONDITION_HINT = `Write it as "left operator right", e.g. "__status__:value = done". Operators: ${CONDITION_OPERATORS.join(" ")}`;
