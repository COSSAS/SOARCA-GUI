import React from "react";

import {
  Badge,
  FormLabel,
  Link,
  Spacer,
  Text,
  ThemeVariant,
} from "@/components";
import { Playbook } from "@/types";

import {
  DetailsGrid,
  DetailsItem,
} from "@/pages/main-page/monitoring-page/ExecutionDetailPage.styles";
import { theme } from "@/theme";
import { formatDateTime } from "@/utils";

interface PlaybookMainDetailsProps {
  playbook: Playbook;
}

export const PlaybookMainDetails: React.FC<PlaybookMainDetailsProps> = ({
  playbook,
}) => {
  const {
    name,
    id,
    playbook_types,
    spec_version,
    created,
    modified,
    priority,
    severity,
    description,
  } = playbook;

  return (
    <Spacer $direction="vertical" $gap="lg" $align="start">
      <DetailsGrid>
        <DetailsItem>
          <FormLabel>Name</FormLabel>
          <Text>{name}</Text>
        </DetailsItem>
        <DetailsItem>
          <FormLabel>ID</FormLabel>
          <Text style={{ wordBreak: "break-all" }}>{id}</Text>
        </DetailsItem>
        <DetailsItem>
          <FormLabel>Type</FormLabel>
          <Text>
            {playbook_types?.map((type, idx) => (
              <Badge key={idx} $variant={ThemeVariant.Info}>
                {type}
              </Badge>
            )) || "N/A"}
          </Text>
        </DetailsItem>
        <DetailsItem>
          <FormLabel>Spec version</FormLabel>
          <Text>{spec_version}</Text>
        </DetailsItem>
        <DetailsItem>
          <FormLabel>Created</FormLabel>
          <Text>{formatDateTime(created)}</Text>
        </DetailsItem>
        <DetailsItem>
          <FormLabel>Modified</FormLabel>
          <Text>{formatDateTime(modified)}</Text>
        </DetailsItem>
        {priority !== undefined && (
          <DetailsItem>
            <FormLabel>Priority</FormLabel>
            <Text>
              <Badge $variant={ThemeVariant.Warning}>{priority}</Badge>
            </Text>
          </DetailsItem>
        )}
        {severity !== undefined && (
          <DetailsItem>
            <FormLabel>Severity</FormLabel>
            <Text>
              <Badge $variant={ThemeVariant.Error}>{severity}</Badge>
            </Text>
          </DetailsItem>
        )}
      </DetailsGrid>
      {description && (
        <DetailsItem>
          <FormLabel>Description</FormLabel>
          <Text>{description}</Text>
        </DetailsItem>
      )}
    </Spacer>
  );
};

interface PlaybookAdditionalDetailsProps {
  playbook: Playbook;
}

export const PlaybookAdditionalDetails: React.FC<
  PlaybookAdditionalDetailsProps
> = ({ playbook }) => {
  const {
    created_by,
    valid_from,
    valid_until,
    impact,
    labels,
    external_references,
  } = playbook;
  return (
    <DetailsGrid>
      <DetailsItem>
        <FormLabel>Created by</FormLabel>
        <Text style={{ wordBreak: "break-all" }}>{created_by}</Text>
      </DetailsItem>
      {impact && (
        <DetailsItem>
          <FormLabel>Impact</FormLabel>
          <Text>
            <Badge $variant={ThemeVariant.Info}>{impact}</Badge>
          </Text>
        </DetailsItem>
      )}
      {valid_from && (
        <DetailsItem>
          <FormLabel>Valid from</FormLabel>
          <Text>{formatDateTime(valid_from)}</Text>
        </DetailsItem>
      )}
      {valid_until && (
        <DetailsItem>
          <FormLabel>Valid until</FormLabel>
          <Text>{formatDateTime(valid_until)}</Text>
        </DetailsItem>
      )}
      {labels && labels.length > 0 && (
        <DetailsItem style={{ gridColumn: "1 / -1" }}>
          <FormLabel>Labels</FormLabel>
          <Text>
            {labels.map((label, idx) => (
              <Badge
                key={idx}
                $variant={ThemeVariant.Info}
                style={{ marginRight: "4px" }}
              >
                {label}
              </Badge>
            ))}
          </Text>
        </DetailsItem>
      )}
      {external_references && external_references.length > 0 && (
        <DetailsItem style={{ gridColumn: "1 / -1" }}>
          <FormLabel>External references</FormLabel>
          <Spacer $direction="vertical" $gap="sm" $align="start">
            {external_references.map((ref, idx) => (
              <Spacer
                key={idx}
                $direction="horizontal"
                $gap="sm"
                $align="center"
                $justify="start"
              >
                <Text style={{ fontWeight: theme.fonts.weight.bold }}>
                  {ref.name}
                </Text>
                {ref.url && (
                  <Link $to={ref.url} target="_blank" rel="noopener noreferrer">
                    {ref.url}
                  </Link>
                )}
              </Spacer>
            ))}
          </Spacer>
        </DetailsItem>
      )}
    </DetailsGrid>
  );
};
