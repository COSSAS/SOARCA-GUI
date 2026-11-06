import type { Playbook, Step } from "@/types";

import { SOARCA_AGENT_TYPES, SOARCA_CAPABILITIES } from "./soarca";
import type { ReferenceSource } from "./specs";

type ReferenceOption = { value: string; label: string };

/** Sources that list what SOARCA can run. The others list what the playbook defines. */
export const SOARCA_SOURCES: ReferenceSource[] = [
  "agentTypes",
  "capabilities",
  "commandTypes",
];

const fromDefinitions = (definitions: Record<string, { name?: string }> = {}) =>
  Object.entries(definitions).map(([id, definition]) => ({
    value: id,
    label: definition.name || id,
  }));

const fromValues = (values: string[]) =>
  [...new Set(values)].map((value) => ({ value, label: value }));

/** Command types the agent of the step can run, or all of them without an agent. */
const getCommandTypes = (playbook: Playbook, step?: Step): string[] => {
  const agent = step?.agent ? playbook.agent_definitions?.[step.agent] : undefined;
  const commandType = agent && SOARCA_CAPABILITIES[agent.name];
  return commandType ? [commandType] : Object.values(SOARCA_CAPABILITIES);
};

export const getReferenceOptions = (
  playbook: Playbook,
  source: ReferenceSource,
  step?: Step,
): ReferenceOption[] => {
  switch (source) {
    case "agents":
      return fromDefinitions(playbook.agent_definitions);
    case "targets":
      return fromDefinitions(playbook.target_definitions);
    case "auth":
      return fromDefinitions(playbook.authentication_info_definitions);
    case "steps":
      return fromDefinitions(playbook.workflow);
    case "variables":
      return fromValues([
        ...Object.keys(playbook.playbook_variables ?? {}),
        ...Object.keys(step?.step_variables ?? {}),
      ]);
    case "agentTypes":
      return fromValues(SOARCA_AGENT_TYPES);
    case "capabilities":
      return fromValues(Object.keys(SOARCA_CAPABILITIES));
    case "commandTypes":
      return fromValues(getCommandTypes(playbook, step));
  }
};
