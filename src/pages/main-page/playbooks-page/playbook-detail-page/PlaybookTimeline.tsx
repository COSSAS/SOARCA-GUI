import { Badge, Icon, Text } from "@/components";
import { ThemeSize, ThemeVariant } from "@/components/utils";
import { Step } from "@/types";
import { ChevronDown, ChevronRight } from "lucide-react";
import React from "react";
import {
  StepCard,
  StepCardBody,
  StepCardHeader,
  StepCardTitle,
  StepCardWrapper,
  TimelineDotCenter,
  TimelineRow,
  TimelineStepCard,
  TimelineVertical,
  TimelineVerticalLine,
} from "./PlaybookTimeline.styles";

export interface PlaybookTimelineProps {
  steps: Array<Step & { id: string }>;
  expandedSteps: Set<string>;
  toggleStep: (id: string) => void;
  playbookWorkflow?: Record<string, Step>;
}

export const PlaybookTimeline: React.FC<PlaybookTimelineProps> = ({
  steps,
  expandedSteps,
  toggleStep,
  playbookWorkflow,
}) => {
  return (
    <TimelineVertical>
      <TimelineVerticalLine />
      {steps.map((step, index) => {
        const align = index % 2 === 0 ? "left" : "right";
        const isExpanded = expandedSteps.has(step.id);
        const delay = index * 0.06;

        return (
          <TimelineRow key={step.id} $delay={delay}>
            <TimelineStepCard $align={align}>
              <TimelineDotCenter $type={step.type} />
              <StepCardWrapper $align={align}>
                <StepCard>
                  <StepCardHeader
                    $expanded={isExpanded}
                    onClick={() => toggleStep(step.id)}
                  >
                    <StepCardTitle>
                      {step.name || step.type || "Step"}
                    </StepCardTitle>
                    <Icon
                      $icon={isExpanded ? ChevronDown : ChevronRight}
                      $size={ThemeSize.Medium}
                    />
                  </StepCardHeader>
                  {isExpanded && (
                    <StepCardBody>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <Text>
                            <strong>Type</strong>
                          </Text>
                          <Text>
                            <Badge $variant={ThemeVariant.Info}>
                              {step.type}
                            </Badge>
                          </Text>
                        </div>

                        {step.description && (
                          <div style={{ gridColumn: "1 / -1" }}>
                            <Text>
                              <strong>Description</strong>
                            </Text>
                            <Text>{step.description}</Text>
                          </div>
                        )}

                        {step.timeout && (
                          <div>
                            <Text>
                              <strong>Timeout</strong>
                            </Text>
                            <Text>{step.timeout}ms</Text>
                          </div>
                        )}

                        {step.delay && (
                          <div>
                            <Text>
                              <strong>Delay</strong>
                            </Text>
                            <Text>{step.delay}ms</Text>
                          </div>
                        )}

                        {step.on_completion && (
                          <div>
                            <Text>
                              <strong>On completion</strong>
                            </Text>
                            <Text style={{ fontSize: "0.75rem" }}>
                              <span title={step.on_completion}>
                                {playbookWorkflow?.[step.on_completion]?.name ??
                                  step.on_completion}
                              </span>
                            </Text>
                          </div>
                        )}

                        {step.on_success && (
                          <div>
                            <Text>
                              <strong>On success</strong>
                            </Text>
                            <Text style={{ fontSize: "0.75rem" }}>
                              <span title={step.on_success}>
                                {playbookWorkflow?.[step.on_success]?.name ??
                                  step.on_success}
                              </span>
                            </Text>
                          </div>
                        )}

                        {step.on_failure && (
                          <div>
                            <Text>
                              <strong>On failure</strong>
                            </Text>
                            <Text style={{ fontSize: "0.75rem" }}>
                              <span title={step.on_failure}>
                                {playbookWorkflow?.[step.on_failure]?.name ??
                                  step.on_failure}
                              </span>
                            </Text>
                          </div>
                        )}
                      </div>
                    </StepCardBody>
                  )}
                </StepCard>
              </StepCardWrapper>
            </TimelineStepCard>
          </TimelineRow>
        );
      })}
    </TimelineVertical>
  );
};

export default PlaybookTimeline;
