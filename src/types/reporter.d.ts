import { Variable } from "./cacao";
import { ISODateString } from "./common";

export type StepExecutionReport = {
  automated_execution?: boolean;
  commands_b64: string[];
  description: string;
  ended: ISODateString;
  executed_by: string;
  execution_id: string;
  name: string;
  started: ISODateString;
  status: SoarcaStepExecutionStatus;
  status_text: string;
  step_id: string;
  variables: Record<string, Variable>;
};

export type SoarcaStepExecutionStatus =
  | "successfully_executed"
  | "ongoing"
  | "failed"
  | "server_side_error"
  | "client_side_error"
  | "timeout_error"
  | "exception_condition_error";

export type PlaybookExecutionReport = {
  description: string;
  ended: ISODateString;
  execution_id: string;
  name: string;
  playbook_id: string;
  request_interval: number;
  started: ISODateString;
  status: SoarcaPlaybookExecutionStatus;
  status_text: string;
  step_results: Record<string, StepExecutionReport>;
  type: string;
};

export type SoarcaPlaybookExecutionStatus =
  | "successfully_executed"
  | "ongoing"
  | "failed";
