import { AgentTarget, Variables } from "./cacao";

export type ManualResponseStatus = "success" | "failure";

export type InteractionCommandData = {
  command: string;
  commandb64?: boolean;
  description: string;
  execution_id: string;
  out_args: Variables;
  playbook_id: string;
  step_id: string;
  target: AgentTarget;
  type: string; // e.g. "execution-status"
};

export type ManualOutArgsUpdatePayload = {
  execution_id: string;
  playbook_id: string;
  response_out_args: Variables;
  response_status: ManualResponseStatus;
  step_id: string;
  type: string;
};
