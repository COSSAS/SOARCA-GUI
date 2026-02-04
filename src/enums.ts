// These enums represent the possible execution statuses for steps and playbooks in the SOARCA system.
// These should be used in the application so that we can easily change them in one place if the API changes.

/** Step Execution Statuses from SOARCA API, not to be confused with the
 *  internal @see StepExecutionStatus */
export const enum SoarcaApiStepExecutionStatus {
  ONGOING = "ongoing",
  SUCCESS = "successfully_executed",
  FAILED = "failed",
  TIMEOUT = "timeout_error",
  SERVER_ERROR = "server_side_error",
  CLIENT_ERROR = "client_side_error",
  EXCEPTION_CONDITION = "exception_condition_error",
}

/** Playbook Execution Statuses from SOARCA API, not to be confused with the
 *  internal @see PlaybookExecutionStatus */
export const enum SoarcaApiPlaybookExecutionStatus {
  ONGOING = "ongoing",
  SUCCESS = "successfully_executed",
  FAILED = "failed",
}

/** Internal Step Execution Statuses used within the application, not to be confused with
 *  @see SoarcaApiStepExecutionStatus which represent the API statuses.
 */
export const enum StepExecutionStatus {
  Executed = "Executed",
  Running = "Running",
  Failed = "Failed",
  ServerSideError = "Server error",
  ClientSideError = "Client error",
  TimeoutError = "Timeout",
  ExceptionConditionError = "Exception",
}

/** Internal Playbook Execution Statuses used within the application, not to be confused with
 *  @see SoarcaApiPlaybookExecutionStatus, which represent the API statuses
 */
export const enum PlaybookExecutionStatus {
  Executed = "Executed",
  Running = "Running",
  Failed = "Failed",
}
