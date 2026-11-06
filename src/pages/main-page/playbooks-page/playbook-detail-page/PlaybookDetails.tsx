import type { ReactNode } from "react";

import {
  Badge,
  CodeBlock,
  CopyButton,
  Link,
  Spacer,
  ThemeVariant,
} from "@/components";
import type { Playbook } from "@/types";
import { formatDateTime } from "@/utils";

import {
  BadgeList,
  DetailSection,
  Description,
  EmptyText,
  Field,
  FieldGrid,
  FieldLabel,
  FieldValue,
  IdValue,
  ReferenceItem,
} from "./PlaybookDetailPage.styles";
import { FieldMessage, SectionTitle } from "../visual-editor/panels/Panel.styles";

// Labels match the playbook fields of the visual editor.

export const DetailField = ({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) => (
  <Field $wide={wide}>
    <FieldLabel>{label}</FieldLabel>
    <FieldValue>{children}</FieldValue>
  </Field>
);

const NotSet = () => <EmptyText>Not set</EmptyText>;

/** Read-only code with a copy button, and an optional warning under it. */
export const CodeField = ({
  label,
  code,
  warning,
}: {
  label: string;
  code: string;
  warning?: string;
}) => (
  <DetailField label={label} wide>
    <Spacer $direction="vertical" $gap="xs" $align="stretch" $justify="start">
      <CodeBlock $code={code} $copyable $maxHeight="20rem" />
      {warning && <FieldMessage>{warning}</FieldMessage>}
    </Spacer>
  </DetailField>
);

const BadgeField = ({
  label,
  values,
  variant,
}: {
  label: string;
  values?: string[];
  variant: ThemeVariant;
}) => (
  <DetailField label={label} wide>
    {values && values.length > 0 ? (
      <BadgeList>
        {values.map((value) => (
          <Badge key={value} $variant={variant}>
            {value}
          </Badge>
        ))}
      </BadgeList>
    ) : (
      <NotSet />
    )}
  </DetailField>
);

const ScoreField = ({
  label,
  value,
  variant,
}: {
  label: string;
  value?: number;
  variant: ThemeVariant;
}) => (
  <DetailField label={label}>
    {value === undefined ? <NotSet /> : <Badge $variant={variant}>{value}</Badge>}
  </DetailField>
);

const DateField = ({ label, value }: { label: string; value?: string }) => (
  <DetailField label={label}>
    {value ? formatDateTime(value) : <NotSet />}
  </DetailField>
);

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <DetailSection>
    <SectionTitle>{title}</SectionTitle>
    <FieldGrid>{children}</FieldGrid>
  </DetailSection>
);

export const PlaybookOverview = ({ playbook }: { playbook: Playbook }) => (
  <>
    <Section title="General">
      <DetailField label="ID" wide>
        <IdValue>
          <span title={playbook.id}>{playbook.id}</span>
          <CopyButton $value={playbook.id} title="Copy ID" />
        </IdValue>
      </DetailField>
      <DetailField label="Created by" wide>
        {playbook.created_by || <NotSet />}
      </DetailField>
      <DateField label="Created" value={playbook.created} />
      <DateField label="Modified" value={playbook.modified} />
      <DetailField label="CACAO version">
        <Badge>{playbook.spec_version}</Badge>
      </DetailField>
    </Section>
    <Section title="Classification">
      <BadgeField
        label="Playbook types"
        values={playbook.playbook_types}
        variant={ThemeVariant.Primary}
      />
      <BadgeField
        label="Playbook activities"
        values={playbook.playbook_activities}
        variant={ThemeVariant.Primary}
      />
      <BadgeField
        label="Labels"
        values={playbook.labels}
        variant={ThemeVariant.Primary}
      />
    </Section>
    <Section title="Scores">
      <ScoreField
        label="Priority (0-100)"
        value={playbook.priority}
        variant={ThemeVariant.Warning}
      />
      <ScoreField
        label="Severity (0-100)"
        value={playbook.severity}
        variant={ThemeVariant.Error}
      />
      <ScoreField
        label="Impact (0-100)"
        value={playbook.impact}
        variant={ThemeVariant.Primary}
      />
    </Section>
    <Section title="Validity">
      <DateField label="Valid from" value={playbook.valid_from} />
      <DateField label="Valid until" value={playbook.valid_until} />
    </Section>
  </>
);

export const PlaybookDescription = ({ playbook }: { playbook: Playbook }) =>
  playbook.description ? (
    <Description>{playbook.description}</Description>
  ) : (
    <EmptyText>This playbook has no description.</EmptyText>
  );

export const PlaybookReferences = ({ playbook }: { playbook: Playbook }) => {
  const references = playbook.external_references ?? [];
  if (references.length === 0) {
    return <EmptyText>This playbook has no external references.</EmptyText>;
  }
  return (
    <div>
      {references.map((reference, index) => (
        <ReferenceItem key={index}>
          <strong>{reference.name}</strong>
          {reference.description && <span>{reference.description}</span>}
          {reference.url && (
            <Link $to={reference.url} target="_blank" rel="noopener noreferrer">
              {reference.url}
            </Link>
          )}
        </ReferenceItem>
      ))}
    </div>
  );
};
