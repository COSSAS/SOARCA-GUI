import { AgentTarget, AuthenticationInformation, Variables } from "./cacao";

export type ManualResponseStatus = "success" | "failure";

export type ManualCommand = {
  command: string;
  commandb64?: boolean;
  description: string;
};

export type ResolvedTarget = {
  target: AgentTarget;
  authentication?: AuthenticationInformation;
};

// One pending manual command/interaction: a whole step (commands + targets),
// individually addressable by (run_id, step_run_id) since a
// step_id can recur (e.g. overlapping while-loop iterations).
export type InteractionCommandData = {
  commands: ManualCommand[];
  run_id: string;
  out_args: Variables;
  playbook_id: string;
  step_run_id: string;
  step_id: string;
  targets: ResolvedTarget[];
  type: string; // "manual-command-info"
};

// Body for PUT /manual/{run_id}/{step_run_id} — the ids are
// resolved from the URL, not repeated in the payload.
export type ManualOutArgsUpdatePayload = {
  response_out_args: Variables;
  response_status: ManualResponseStatus;
  type: string;
};
