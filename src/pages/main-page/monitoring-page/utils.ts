import { ThemeVariant } from "@/components/utils";
import {
  PlaybookExecutionStatus,
  SoarcaApiPlaybookExecutionStatus,
  SoarcaApiStepExecutionStatus,
  StepExecutionStatus,
} from "@/enums";
import {
  SoarcaPlaybookExecutionStatus,
  SoarcaStepExecutionStatus,
} from "@/types";
import { Check, LucideIcon, PlayIcon, X } from "lucide-react";

const SOARCA_STEP_STATUS_MAP: Record<
  SoarcaStepExecutionStatus,
  StepExecutionStatus
> = {
  [SoarcaApiStepExecutionStatus.SUCCESS]: StepExecutionStatus.Executed,
  [SoarcaApiStepExecutionStatus.ONGOING]: StepExecutionStatus.Running,
  [SoarcaApiStepExecutionStatus.FAILED]: StepExecutionStatus.Failed,
  [SoarcaApiStepExecutionStatus.TIMEOUT]: StepExecutionStatus.TimeoutError,
  [SoarcaApiStepExecutionStatus.SERVER_ERROR]:
    StepExecutionStatus.ServerSideError,
  [SoarcaApiStepExecutionStatus.CLIENT_ERROR]:
    StepExecutionStatus.ClientSideError,
  [SoarcaApiStepExecutionStatus.EXCEPTION_CONDITION]:
    StepExecutionStatus.ExceptionConditionError,
};

export function getStepStatusFromSoarcaStatus(
  stepStatus?: SoarcaStepExecutionStatus,
): StepExecutionStatus {
  return stepStatus
    ? SOARCA_STEP_STATUS_MAP[stepStatus]
    : StepExecutionStatus.Failed;
}

const SOARCA_PLAYBOOK_STATUS_MAP: Record<
  SoarcaPlaybookExecutionStatus,
  PlaybookExecutionStatus
> = {
  [SoarcaApiPlaybookExecutionStatus.SUCCESS]: PlaybookExecutionStatus.Executed,
  [SoarcaApiPlaybookExecutionStatus.ONGOING]: PlaybookExecutionStatus.Running,
  [SoarcaApiPlaybookExecutionStatus.FAILED]: PlaybookExecutionStatus.Failed,
};

export function getPlaybookStatusFromSoarcaStatus(
  playbookStatus?: SoarcaPlaybookExecutionStatus,
): PlaybookExecutionStatus {
  return playbookStatus
    ? SOARCA_PLAYBOOK_STATUS_MAP[playbookStatus]
    : PlaybookExecutionStatus.Failed;
}

const PLAYBOOK_STATUS_TO_BADGE_MAP: Record<
  PlaybookExecutionStatus,
  ThemeVariant
> = {
  [PlaybookExecutionStatus.Executed]: ThemeVariant.Success,
  [PlaybookExecutionStatus.Running]: ThemeVariant.Warning,
  [PlaybookExecutionStatus.Failed]: ThemeVariant.Error,
};

const PLAYBOOK_STATUS_TO_ICON_MAP: Record<PlaybookExecutionStatus, LucideIcon> =
  {
    [PlaybookExecutionStatus.Executed]: Check,
    [PlaybookExecutionStatus.Running]: PlayIcon,
    [PlaybookExecutionStatus.Failed]: X,
  };

export const getBadgeVariantFromStatus = (
  status: PlaybookExecutionStatus,
): ThemeVariant => PLAYBOOK_STATUS_TO_BADGE_MAP[status];

export const getIconFromStatus = (
  status: PlaybookExecutionStatus,
): LucideIcon => PLAYBOOK_STATUS_TO_ICON_MAP[status];

const STEP_STATUS_TO_BADGE_MAP: Record<StepExecutionStatus, ThemeVariant> = {
  [StepExecutionStatus.Executed]: ThemeVariant.Success,
  [StepExecutionStatus.Running]: ThemeVariant.Warning,
  [StepExecutionStatus.Failed]: ThemeVariant.Error,
  [StepExecutionStatus.ServerSideError]: ThemeVariant.Error,
  [StepExecutionStatus.ClientSideError]: ThemeVariant.Error,
  [StepExecutionStatus.TimeoutError]: ThemeVariant.Error,
  [StepExecutionStatus.ExceptionConditionError]: ThemeVariant.Error,
};

const STEP_STATUS_TO_ICON_MAP: Record<StepExecutionStatus, LucideIcon> = {
  [StepExecutionStatus.Executed]: Check,
  [StepExecutionStatus.Running]: PlayIcon,
  [StepExecutionStatus.Failed]: X,
  [StepExecutionStatus.ServerSideError]: X,
  [StepExecutionStatus.ClientSideError]: X,
  [StepExecutionStatus.TimeoutError]: X,
  [StepExecutionStatus.ExceptionConditionError]: X,
};

export const getBadgeVariantFromStepStatus = (
  status: StepExecutionStatus,
): ThemeVariant => STEP_STATUS_TO_BADGE_MAP[status] ?? ThemeVariant.Error;

export const getIconFromStepStatus = (
  status: StepExecutionStatus,
): LucideIcon => STEP_STATUS_TO_ICON_MAP[status] ?? X;

export interface UserActionResponse {
  name: string;
  value: string;
  type: string;
}

export interface UserActionCardProperties {
  variant: ThemeVariant;
  message: string | null;
}

/**
 * Determine the badge properties for a completed user action step.
 * @param userResponses - The list of user action responses
 * @param stepStatus - The execution status of the step
 * @returns The badge variant and optional message for the user action card
 * @todo SOARCA should return more specific information about user actions to avoid these heuristics
 */
export const getUserCompletedActionCardProperties = (
  userResponses: UserActionResponse[],
  stepStatus: StepExecutionStatus,
): UserActionCardProperties => {
  const hasResponses = userResponses.length > 0;
  const isSuccess = stepStatus === StepExecutionStatus.Executed;

  if (isSuccess && hasResponses) {
    // User submitted values successfully
    return { variant: ThemeVariant.Success, message: null };
  }

  if (isSuccess && !hasResponses) {
    // User confirmed the action
    return {
      variant: ThemeVariant.Success,
      message: "User confirmed the action",
    };
  }

  if (!isSuccess && hasResponses) {
    // User submitted something but step failed
    return { variant: ThemeVariant.Error, message: null };
  }

  // Step failed and no responses
  return {
    variant: ThemeVariant.Error,
    message:
      "User did not perform the action in time or rejected it. Check the logs for more information.",
  };
};
