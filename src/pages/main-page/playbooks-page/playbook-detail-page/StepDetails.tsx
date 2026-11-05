import { Badge, CopyButton, Spacer } from "@/components";
import type { Playbook } from "@/types";

import { CommandList } from "./CommandList";
import {
  BadgeList,
  Description,
  EmptyText,
  IdValue,
} from "./PlaybookDetailPage.styles";
import { CodeField, DetailField, Section } from "./PlaybookDetails";
import { getStepDetails } from "./stepFields";

const isPlain = (value: unknown) => value === null || typeof value !== "object";

const StepField = ({ label, value }: { label: string; value: unknown }) => {
  if (isPlain(value))
    return <DetailField label={label}>{String(value)}</DetailField>;
  if (Array.isArray(value) && value.every(isPlain))
    return (
      <DetailField label={label} wide>
        <BadgeList>
          {value.map((item) => (
            <Badge key={String(item)}>{String(item)}</Badge>
          ))}
        </BadgeList>
      </DetailField>
    );
  return <CodeField label={label} code={JSON.stringify(value, null, 2)} />;
};

/** All fields of the step selected in the read-only diagram. */
export const StepDetails = ({
  playbook,
  stepId,
}: {
  playbook: Playbook;
  stepId?: string;
}) => {
  const step = stepId ? playbook.workflow[stepId] : undefined;
  if (!stepId || !step)
    return <EmptyText>Select a step in the diagram to see its details.</EmptyText>;

  const { typeLabel, details } = getStepDetails(step, playbook);

  return (
    <Spacer $direction="vertical" $gap="lg" $align="stretch" $justify="start">
      <Section title="General">
        {step.name && (
          <DetailField label="Name" wide>
            {step.name}
          </DetailField>
        )}
        <DetailField label="Type">
          <Badge>{typeLabel}</Badge>
        </DetailField>
        <DetailField label="ID" wide>
          <IdValue>
            <span title={stepId}>{stepId}</span>
            <CopyButton $value={stepId} title="Copy ID" />
          </IdValue>
        </DetailField>
        {step.description && (
          <DetailField label="Description" wide>
            <Description>{step.description}</Description>
          </DetailField>
        )}
        {details.map(({ key, label, value }) => (
          <StepField key={key} label={label} value={value} />
        ))}
      </Section>
      <CommandList commands={step.commands ?? []} />
    </Spacer>
  );
};
