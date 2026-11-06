import { cacao20 } from "./cacao-2.0";
import type { CacaoSpec } from "./types";

const SPECS: CacaoSpec[] = [cacao20];

/** Used for new playbooks. */
export const LATEST_SPEC = cacao20;

export const SUPPORTED_SPEC_VERSIONS = SPECS.map((spec) => spec.version);

/** Returns the spec for a playbook's `spec_version`, or undefined if the editor does not support it. */
export const getSpec = (version: string): CacaoSpec | undefined =>
  SPECS.find((spec) => spec.version === version);

export type * from "./types";
export { PLAYBOOK_TABS, STEP_TABS } from "./types";
