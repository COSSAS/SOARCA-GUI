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
// individually addressable by (execution_id, step_execution_id) since a
// step_id can recur (e.g. overlapping while-loop iterations).
export type InteractionCommandData = {
  commands: ManualCommand[];
  execution_id: string;
  out_args: Variables;
  playbook_id: string;
  step_execution_id: string;
  step_id: string;
  targets: ResolvedTarget[];
  type: string; // e.g. "execution-status"
};

// Body for PUT /manual/{execution_id}/{step_execution_id} — the ids are
// resolved from the URL, not repeated in the payload.
export type ManualOutArgsUpdatePayload = {
  response_out_args: Variables;
  response_status: ManualResponseStatus;
  type: string;
};
