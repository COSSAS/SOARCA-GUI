import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import React from "react";
import { useParams } from "react-router";

import { getFinById } from "@/api/fin";
import { getErrorFromApiResponse } from "@/api/utils";
import {
  Badge,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  CenteredCardContent,
  CopyButton,
  FormLabel,
  Icon,
  Link,
  Spacer,
  Spinner,
  Text,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import { formatDateTime, PATHS } from "@/utils";

import {
  CapabilityCard,
  CapabilityHeader,
  CodeBlock,
  DetailsGrid,
  DetailsItem,
  StepExamplesList,
} from "./FinDetailPage.styles";

export const FinDetailPage: React.FC = () => {
  const { finId } = useParams();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fin", finId],
    queryFn: () => getFinById(finId!),
    enabled: !!finId,
    refetchOnWindowFocus: false,
  });

  const fin = data;
  const parsedError = getErrorFromApiResponse(error);

  const renderBody = () => {
    if (isLoading)
      return (
        <CenteredCardContent>
          <Spinner $size={ThemeSize.Large} />
        </CenteredCardContent>
      );
    if (isError || !fin)
      return (
        <Text>
          {isError
            ? parsedError?.message || "Could not load fin"
            : "Fin not found"}
        </Text>
      );

    return (
      <Spacer $direction="vertical" $gap="lg" $align="start">
        <DetailsGrid>
          <DetailsItem>
            <FormLabel>Fin ID</FormLabel>
            <Spacer $direction="horizontal" $gap="xs" $align="center">
              <Text>{fin.fin_id}</Text>
              <CopyButton $text={fin.fin_id} />
            </Spacer>
          </DetailsItem>
          <DetailsItem>
            <FormLabel>Protocol version</FormLabel>
            <Text>{fin.protocol_version || "—"}</Text>
          </DetailsItem>
          <DetailsItem>
            <FormLabel>Registered</FormLabel>
            <Text>{formatDateTime(fin.registered_at)}</Text>
          </DetailsItem>
          <DetailsItem>
            <FormLabel>Last seen</FormLabel>
            <Text>{formatDateTime(fin.last_seen)}</Text>
          </DetailsItem>
        </DetailsGrid>

        <Spacer $direction="vertical" $gap="md" $align="start">
          <FormLabel>Capabilities ({fin.capabilities.length})</FormLabel>
          {fin.capabilities.map((capability) => (
            <CapabilityCard key={capability.type}>
              <CapabilityHeader>
                <Spacer $direction="horizontal" $gap="sm" $align="center">
                  <Badge $variant={ThemeVariant.Info}>{capability.type}</Badge>
                  {capability.version && <Text>v{capability.version}</Text>}
                </Spacer>
              </CapabilityHeader>
              {capability.description && <Text>{capability.description}</Text>}
              {capability.step_examples &&
                capability.step_examples.length > 0 && (
                  <StepExamplesList>
                    <FormLabel>
                      Example step{capability.step_examples.length > 1 && "s"}
                    </FormLabel>
                    {capability.step_examples.map((step, idx) => (
                      <CodeBlock key={idx}>
                        {JSON.stringify(step, null, 2)}
                      </CodeBlock>
                    ))}
                  </StepExamplesList>
                )}
            </CapabilityCard>
          ))}
        </Spacer>
      </Spacer>
    );
  };

  return (
    <Spacer $direction="vertical" $gap="lg" $align="start">
      <Link $to={PATHS.FINS.BASE}>
        <Icon $icon={ArrowLeft} />
        Back to fins
      </Link>
      <CardContainer>
        <CardHeader>
          <CardTitle>{fin?.display_name || fin?.fin_id || "Fin"}</CardTitle>
        </CardHeader>
        <CardBody>{renderBody()}</CardBody>
      </CardContainer>
    </Spacer>
  );
};
