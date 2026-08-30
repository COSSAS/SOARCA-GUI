import { Variable } from "./cacao";
import { ISODateString } from "./common";

export type StepRunReport = {
  automated_execution?: boolean;
  commands_b64: string[];
  description: string;
  ended: ISODateString;
  executed_by: string;
  run_id: string;
  name: string;
  started: ISODateString;
  status: SoarcaStepRunStatus;
  status_text: string;
  step_run_id: string;
  step_id: string;
  type: string;
  variables: Record<string, Variable>;
};

export type SoarcaStepRunStatus =
  | "successfully_executed"
  | "ongoing"
  | "failed"
  | "server_side_error"
  | "client_side_error"
  | "timeout_error"
  | "exception_condition_error";

export type PlaybookRunReport = {
  description: string;
  ended: ISODateString;
  run_id: string;
  name: string;
  playbook_id: string;
  request_interval: number;
  started: ISODateString;
  status: SoarcaPlaybookRunStatus;
  status_text: string;
  step_results: Record<string, StepRunReport>;
  type: string;
};

export type SoarcaPlaybookRunStatus =
  "successfully_executed" | "ongoing" | "failed";
