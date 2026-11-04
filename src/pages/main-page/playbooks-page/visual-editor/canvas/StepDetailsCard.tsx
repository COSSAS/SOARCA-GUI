import { IconX } from "@tabler/icons-react";

import { Button, Icon, ThemeSize, ThemeVariant } from "@/components";
import type { Step } from "@/types";

import { getStepFields } from "../model/fields";
import type { CacaoSpec, StepTypeDefinition } from "../model/specs";
import { UNKNOWN_STEP_COLOR, UNKNOWN_STEP_ICON } from "./constants";
import {
  DetailsBody,
  DetailsCard,
  DetailsCode,
  DetailsEmpty,
  DetailsField,
  DetailsHeader,
  DetailsHeading,
  DetailsLabel,
  DetailsTitle,
  DetailsType,
  DetailsValue,
} from "./StepDetailsCard.styles";
import { StepIcon } from "./StepIcon";

type StepDetailsCardProps = {
  step: Step;
  definition: StepTypeDefinition | undefined;
  spec: CacaoSpec;
  onClose: () => void;
};

const OMITTED_FIELDS = new Set([
  "id",
  "uuid",
  "type",
  "cases",
  "next_steps",
  "on_completion",
  "on_failure",
  "on_false",
  "on_success",
  "on_true",
  "step_extensions",
]);

/** `out_args` reads as "Out args", matching the spec field labels. */
const toLabel = (key: string) => {
  const words = key.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const isPlain = (value: unknown) =>
  value === null || typeof value !== "object";

/** Plain values and lists of them read as text; anything structured as JSON. */
const FieldValue: React.FC<{ value: unknown }> = ({ value }) => {
  if (isPlain(value)) return <DetailsValue>{String(value)}</DetailsValue>;
  if (Array.isArray(value) && value.every(isPlain))
    return <DetailsValue>{value.join(", ")}</DetailsValue>;
  return (
    <DetailsValue>
      <DetailsCode>{JSON.stringify(value, null, 2)}</DetailsCode>
    </DetailsValue>
  );
};

/** Fields of a step in the read-only diagram, shown when it is clicked. */
export const StepDetailsCard: React.FC<StepDetailsCardProps> = ({
  step,
  definition,
  spec,
  onClose,
}) => {
  const typeLabel = definition?.label ?? step.type;
  const fields = getStepFields(spec, definition);
  const knownFields = new Set<string>(fields.map((field) => field.key));
  const details = [
    ...fields
      .filter((field) => field.key !== "name" && step[field.key] !== undefined)
      .map((field) => [field.label, step[field.key]] as const),
    ...Object.entries(step)
      .filter(
        ([key, value]) =>
          !knownFields.has(key) &&
          !OMITTED_FIELDS.has(key) &&
          value !== undefined,
      )
      .map(([key, value]) => [toLabel(key), value] as const),
  ];

  const color = definition?.color ?? UNKNOWN_STEP_COLOR;

  return (
    <DetailsCard $color={color}>
      <DetailsHeader>
        <DetailsHeading>
          <DetailsType>
            <StepIcon icon={definition?.icon ?? UNKNOWN_STEP_ICON} $color={color} />
            {typeLabel}
          </DetailsType>
          <DetailsTitle>{step.name || typeLabel}</DetailsTitle>
        </DetailsHeading>
        <Button
          $variant={ThemeVariant.Primary}
          $ghost
          $size={ThemeSize.Small}
          title="Close"
          onClick={onClose}
        >
          <Icon $icon={IconX} $size={ThemeSize.Small} />
        </Button>
      </DetailsHeader>
      <DetailsBody>
        {details.length ? (
          details.map(([label, value]) => (
            <DetailsField key={label}>
              <DetailsLabel>{label}</DetailsLabel>
              <FieldValue value={value} />
            </DetailsField>
          ))
        ) : (
          <DetailsEmpty>No additional details</DetailsEmpty>
        )}
      </DetailsBody>
    </DetailsCard>
  );
};
