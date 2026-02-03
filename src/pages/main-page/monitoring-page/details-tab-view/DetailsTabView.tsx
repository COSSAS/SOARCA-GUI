import { Check, X } from "lucide-react";
import React from "react";

import {
  Badge,
  CopyButton,
  ExpandableCard,
  ExpandableText,
  FormLabel,
  Icon,
  Spacer,
  Text,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import {
  DetailsGrid,
  DetailsItem,
} from "@/pages/main-page/monitoring-page/ExecutionDetailPage.styles";
import {
  getBadgeVariantFromStepStatus,
  getIconFromStepStatus,
  getStepStatusFromSoarcaStatus,
} from "@/pages/main-page/monitoring-page/utils";
import { StepExecutionReport } from "@/types";
import {
  computeDurationMs,
  decodeBase64,
  formatDateTime,
  formatDuration,
} from "@/utils";
import {
  CodeBlock,
  DetailedContainer,
  DetailedItemSummary,
  Placeholder,
  VariableCellValue,
  VariableItemRow,
  VariableListContainer,
} from "./DetailsTabView.styles";

const renderAutomatedIcon = (isAutomated: boolean | undefined) => {
  switch (isAutomated) {
    case true:
      return (
        <Icon
          $icon={Check}
          $size={ThemeSize.Medium}
          $variant={ThemeVariant.Success}
          $round
        />
      );
    case false:
      return (
        <Icon
          $icon={X}
          $size={ThemeSize.Medium}
          $variant={ThemeVariant.Error}
          $round
        />
      );
    default:
      return <Text>-</Text>;
  }
};

interface DetailsTabViewProps {
  steps: StepExecutionReport[];
}

export const DetailsTabView: React.FC<DetailsTabViewProps> = ({ steps }) => {
  if (steps.length === 0) {
    return <Placeholder>No step details available.</Placeholder>;
  }

  return (
    <DetailedContainer>
      {steps.map((step) => {
        const { step_id, status: soarcaStatus } = step;
        const status = getStepStatusFromSoarcaStatus(soarcaStatus);

        return (
          <ExpandableCard
            key={step_id}
            $defaultExpanded={true}
            $header={
              <Spacer
                $direction="horizontal"
                $gap="lg"
                $align="center"
                $justify="space-between"
              >
                <Spacer $direction="vertical" $gap="xs" $align="start">
                  <Text>{step.name || "Unnamed step"}</Text>
                  <DetailedItemSummary>
                    <span>Started: {formatDateTime(step.started)}</span>
                    <span>•</span>
                    <span>Ended: {formatDateTime(step.ended)}</span>
                    <span>•</span>
                    <span>
                      Duration:{" "}
                      {formatDuration(
                        computeDurationMs(step.started, step.ended),
                      )}
                    </span>
                  </DetailedItemSummary>
                </Spacer>
                <Icon
                  $icon={getIconFromStepStatus(status)}
                  $round
                  $variant={getBadgeVariantFromStepStatus(status)}
                  $size={ThemeSize.Medium}
                />
              </Spacer>
            }
          >
            <Spacer $direction="vertical" $gap="md" $align="start">
              <DetailsGrid>
                <DetailsItem>
                  <FormLabel>Execution ID</FormLabel>
                  <Text>{step.execution_id || "—"}</Text>
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Status</FormLabel>
                  <Badge $variant={getBadgeVariantFromStepStatus(status)}>
                    <Icon
                      $icon={getIconFromStepStatus(status)}
                      $size={ThemeSize.Medium}
                    />
                    {status}
                  </Badge>
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Description</FormLabel>
                  <ExpandableText
                    $text={<Text>{step.description || "—"}</Text>}
                  />
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Status text</FormLabel>
                  <ExpandableText
                    $text={<Text>{step.status_text || "—"}</Text>}
                  />
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Step ID</FormLabel>
                  <Text>{step.step_id || "—"}</Text>
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Executed by</FormLabel>
                  <Text>{step.executed_by || "—"}</Text>
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Started</FormLabel>
                  <Text>{formatDateTime(step.started)}</Text>
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Ended</FormLabel>
                  <Text>{formatDateTime(step.ended)}</Text>
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Duration</FormLabel>
                  <Text>
                    {formatDuration(
                      computeDurationMs(step.started, step.ended),
                    )}
                  </Text>
                </DetailsItem>
                <DetailsItem>
                  <FormLabel>Automated</FormLabel>
                  {renderAutomatedIcon(step.automated_execution)}
                </DetailsItem>
              </DetailsGrid>
              <div style={{ width: "100%" }}>
                <Spacer
                  $direction="vertical"
                  $gap="md"
                  $align="start"
                  $justify="space-between"
                >
                  <DetailsItem style={{ width: "100%" }}>
                    <Spacer
                      $direction="horizontal"
                      $gap="md"
                      $align="center"
                      $justify="space-between"
                    >
                      <FormLabel>Commands</FormLabel>
                      <div>
                        {Array.isArray(step.commands_b64) &&
                          step.commands_b64.length > 0 && (
                            <CopyButton
                              $text={step.commands_b64
                                .map((c) => decodeBase64(c) || c)
                                .join("\n")}
                              title="Copy commands"
                            />
                          )}
                      </div>
                    </Spacer>

                    {Array.isArray(step.commands_b64) &&
                    step.commands_b64.length > 0 ? (
                      step.commands_b64.map((cmd, i) => (
                        <CodeBlock key={`cmd-${i}`}>
                          {decodeBase64(cmd) || cmd}
                        </CodeBlock>
                      ))
                    ) : (
                      <CodeBlock>// no commands</CodeBlock>
                    )}
                  </DetailsItem>
                  <DetailsItem style={{ width: "100%" }}>
                    <Spacer
                      $direction="horizontal"
                      $gap="md"
                      $align="center"
                      $justify="space-between"
                    >
                      <FormLabel>Variables</FormLabel>
                      <div>
                        {step.variables &&
                          Object.keys(step.variables).length > 0 && (
                            <CopyButton
                              $text={Object.entries(step.variables)
                                .map(
                                  ([k, v]) =>
                                    `${v?.name || k} (${v?.type || "unknown"}): ${v?.value ?? ""}`,
                                )
                                .join("\n")}
                              title="Copy variables"
                            />
                          )}
                      </div>
                    </Spacer>

                    {step.variables &&
                    Object.keys(step.variables).length > 0 ? (
                      <VariableListContainer>
                        {Object.entries(step.variables).map(
                          ([key, variable]) => {
                            const valueStr = String(variable?.value ?? "");
                            const isTruncated = valueStr.length > 75;
                            const displayValue = isTruncated
                              ? valueStr.substring(0, 75) + "..."
                              : valueStr;
                            const varName = variable?.name || key;
                            const varType = variable?.type || "unknown";

                            return (
                              <VariableItemRow key={key}>
                                <VariableCellValue
                                  style={{
                                    cursor: isTruncated ? "help" : "default",
                                  }}
                                  title={isTruncated ? valueStr : undefined}
                                >
                                  <strong>{varName}</strong> ({varType}) :{" "}
                                  {displayValue}
                                </VariableCellValue>
                              </VariableItemRow>
                            );
                          },
                        )}
                      </VariableListContainer>
                    ) : (
                      <VariableItemRow>
                        <VariableCellValue
                          style={{
                            color: "var(--text-secondary)",
                            textAlign: "center",
                            flex: 1,
                          }}
                        >
                          No variables available
                        </VariableCellValue>
                      </VariableItemRow>
                    )}
                  </DetailsItem>
                </Spacer>
              </div>
            </Spacer>
          </ExpandableCard>
        );
      })}
    </DetailedContainer>
  );
};
