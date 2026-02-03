import { BadgeAlert, Check, Hand, X } from "lucide-react";
import React, { useState } from "react";

import {
  Icon,
  NotificationCard,
  Spacer,
  Spinner,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import { StepExecutionStatus } from "@/enums";
import {
  getBadgeVariantFromStepStatus,
  getStepStatusFromSoarcaStatus,
  getUserCompletedActionCardProperties,
  UserActionResponse,
} from "@/pages/main-page/monitoring-page/utils";
import { PlaybookExecutionReport, StepExecutionReport } from "@/types";
import {
  computeDurationMs,
  formatDateTime,
  formatDuration,
  parseDate,
  sortByNumber,
} from "@/utils";
import { QueryObserverResult } from "@tanstack/react-query";
import { ManualActionModal } from "./ManualActionModal";
import {
  ResponseItem,
  ResponseList,
  TimelineCenterLine,
  TimelineContainer,
  TimelineHeader,
  TimelineIconContainer,
  TimelineItem,
  TimelineItemWrapper,
  TimelineLeftCell,
  TimelineMetaBadge,
  TimelineRightCell,
  TimelineRow,
  TimelineSpacer,
  TimelineTitle,
  UserPendingActionItem,
  UserReplyItem,
} from "./TimelineTabView.styles";

const dateExtractor = (step: StepExecutionReport) => {
  const date = parseDate(step.started);
  return date ? date.getTime() : undefined;
};

const getUserResponses = (step: StepExecutionReport): UserActionResponse[] => {
  const stepVariables = step.variables;

  if (!stepVariables) {
    return [];
  }

  return Object.entries(stepVariables).map(([name, variable]) => {
    return {
      name: variable?.name || name,
      value: variable?.value || "",
      type: variable?.type || "unknown",
    };
  });
};

interface TimelineViewProps {
  steps: StepExecutionReport[];
  playbookId?: string;
  executionId?: string;
  onRefetch?: () => Promise<
    QueryObserverResult<PlaybookExecutionReport, unknown>
  >;
}

export const TimelineTabView: React.FC<TimelineViewProps> = ({
  steps,
  playbookId,
  executionId,
  onRefetch,
}) => {
  // We use this state to pass the right step to the manual action modal
  // when the user clicks on the "User action required" card
  const [selectedActionStep, setSelectedActionStep] =
    useState<StepExecutionReport | null>(null);

  const resetSelectedActionStep = () => {
    setSelectedActionStep(null);
  };

  const sortedSteps = sortByNumber(steps, dateExtractor);

  return (
    <>
      <TimelineContainer>
        <TimelineCenterLine />
        {sortedSteps.map((step, stepIndex) => {
          const { step_id, status: soarcaStatus, automated_execution } = step;
          const status = getStepStatusFromSoarcaStatus(soarcaStatus);

          const isStepTerminated = status !== StepExecutionStatus.Running;
          const isStepManualAndOngoing =
            !isStepTerminated && !automated_execution;

          // Determine if we should display the user action cards showing user responses.
          // We only display it if the step is not automated, it has been completed successfully.
          const shouldDisplayUserActionResponseCard =
            isStepTerminated && !automated_execution;

          const userResponses = shouldDisplayUserActionResponseCard
            ? getUserResponses(step)
            : [];

          // used to stagger the rows animation
          let rowIndex = 0;

          return (
            <React.Fragment key={step_id}>
              <TimelineRow $delay={stepIndex * 0.15 + rowIndex++ * 0.15}>
                <TimelineLeftCell>
                  <StepCard step={step} />
                </TimelineLeftCell>
                <TimelineIconContainer>
                  {status === StepExecutionStatus.Running ? (
                    <Spinner
                      $variant={ThemeVariant.Warning}
                      $size={ThemeSize.Large}
                      $withContainer
                    />
                  ) : status === StepExecutionStatus.Executed ? (
                    <Icon
                      $icon={Check}
                      $round
                      $variant={ThemeVariant.Success}
                    />
                  ) : (
                    <Icon $icon={X} $round $variant={ThemeVariant.Error} />
                  )}
                </TimelineIconContainer>
                <TimelineRightCell>
                  <TimelineSpacer />
                </TimelineRightCell>
              </TimelineRow>
              {isStepManualAndOngoing && (
                <TimelineRow $delay={stepIndex * 0.15 + rowIndex++ * 0.15}>
                  <TimelineLeftCell>
                    <TimelineSpacer />
                  </TimelineLeftCell>
                  <TimelineIconContainer>
                    <Icon
                      $icon={BadgeAlert}
                      $round
                      $variant={ThemeVariant.Info}
                    />
                  </TimelineIconContainer>
                  <TimelineRightCell>
                    <TimelineItemWrapper $side="right">
                      <UserPendingActionCard
                        onClick={() => setSelectedActionStep(step)}
                      />
                    </TimelineItemWrapper>
                  </TimelineRightCell>
                </TimelineRow>
              )}
              {shouldDisplayUserActionResponseCard && (
                <TimelineRow $delay={stepIndex * 0.15 + rowIndex++ * 0.15}>
                  <TimelineLeftCell>
                    <TimelineSpacer />
                  </TimelineLeftCell>
                  <TimelineIconContainer>
                    <Icon
                      $icon={Hand}
                      $round
                      $variant={
                        status === StepExecutionStatus.Executed
                          ? ThemeVariant.Success
                          : ThemeVariant.Error
                      }
                    />
                  </TimelineIconContainer>
                  <TimelineRightCell>
                    <TimelineItemWrapper $side="right">
                      <UserCompletedActionCard
                        stepStatus={status}
                        userResponses={userResponses}
                      />
                    </TimelineItemWrapper>
                  </TimelineRightCell>
                </TimelineRow>
              )}
            </React.Fragment>
          );
        })}
      </TimelineContainer>
      <ManualActionModal
        key={selectedActionStep?.step_id ?? "none"} // reset modal state when changing step
        activeStep={selectedActionStep}
        playbookId={playbookId}
        executionId={executionId}
        onClose={resetSelectedActionStep}
        onSuccess={onRefetch}
      />
    </>
  );
};

interface StepCardProps {
  step: StepExecutionReport;
}

const StepCard: React.FC<StepCardProps> = ({ step }) => {
  const { name, started, ended, status: soarcaStatus } = step;
  const status = getStepStatusFromSoarcaStatus(soarcaStatus);
  const isStepCompleted = status !== StepExecutionStatus.Running;
  return (
    <TimelineItemWrapper $side="left">
      <TimelineItem>
        <NotificationCard $variant={getBadgeVariantFromStepStatus(status)}>
          <Spacer $direction="vertical" $gap="xs" $align="start">
            <TimelineHeader>
              <TimelineTitle>{name || "-"}</TimelineTitle>
            </TimelineHeader>
            <TimelineMetaBadge>
              <span>{formatDateTime(started)}</span>
              {isStepCompleted && ended && (
                <>
                  <span>→</span>
                  <span>{formatDateTime(ended, true)}</span>
                  <span>
                    ({formatDuration(computeDurationMs(started, ended))})
                  </span>
                </>
              )}
            </TimelineMetaBadge>
          </Spacer>
        </NotificationCard>
      </TimelineItem>
    </TimelineItemWrapper>
  );
};

const UserCompletedActionCard: React.FC<{
  stepStatus: StepExecutionStatus;
  userResponses: UserActionResponse[];
}> = ({ stepStatus, userResponses }) => {
  const { variant, message } = getUserCompletedActionCardProperties(
    userResponses,
    stepStatus,
  );
  return (
    <UserReplyItem>
      <NotificationCard $variant={variant}>
        <Spacer $direction="vertical" $gap="xs" $align="start">
          <TimelineHeader>
            <TimelineTitle>User action</TimelineTitle>
          </TimelineHeader>
          {message ? (
            <TimelineMetaBadge>
              <span>{message}</span>
            </TimelineMetaBadge>
          ) : (
            <ResponseList>
              {userResponses.map((response, idx) => (
                <ResponseItem key={idx}>
                  <span>
                    {response.name}: {response.value || "no value"} (
                    {response.type || "unknown type"})
                  </span>
                </ResponseItem>
              ))}
            </ResponseList>
          )}
        </Spacer>
      </NotificationCard>
    </UserReplyItem>
  );
};

interface UserActionCardProps {
  onClick: () => void;
}
const UserPendingActionCard: React.FC<UserActionCardProps> = ({ onClick }) => {
  return (
    <UserPendingActionItem onClick={onClick}>
      <TimelineItem>
        <NotificationCard $variant={ThemeVariant.Info}>
          <Spacer $direction="vertical" $gap="xs" $align="start">
            <TimelineHeader>
              <TimelineTitle>User action required</TimelineTitle>
            </TimelineHeader>
            <TimelineMetaBadge>
              <span>Click here to see what to do</span>
            </TimelineMetaBadge>
          </Spacer>
        </NotificationCard>
      </TimelineItem>
    </UserPendingActionItem>
  );
};
