import { useQuery } from "@tanstack/react-query";
import React from "react";

import { getSystemStatus } from "@/api/status";
import { getErrorFromApiResponse } from "@/api/utils";
import {
  Badge,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  FormLabel,
  Spacer,
  SuspenseCard,
  ThemeVariant,
} from "@/components";
import {
  DetailsGrid,
  DetailsItem,
  DetailsValue,
} from "@/pages/main-page/monitoring-page/ExecutionDetailPage.styles";
import { formatDateTime, formatDuration } from "@/utils";
import { CreditsEasterEgg } from "./Credits";

export const SettingsPage: React.FC = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["system-status"],
    queryFn: getSystemStatus,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });

  const parsedError = getErrorFromApiResponse(error as Error);
  return (
    <SuspenseCard
      $isLoading={isLoading}
      $isError={isError}
      $errorMessage={parsedError?.message}
    >
      <Spacer $direction="vertical" $gap="lg">
        <CardContainer>
          <CardHeader>
            <CardTitle>SOARCA information</CardTitle>
          </CardHeader>
          <CardBody>
            <DetailsGrid>
              <DetailsItem>
                <FormLabel>Status</FormLabel>
                <DetailsValue>
                  <Badge
                    $variant={
                      isError ? ThemeVariant.Error : ThemeVariant.Success
                    }
                  >
                    {isError ? "Error" : "Online"}
                  </Badge>
                </DetailsValue>
              </DetailsItem>
              <DetailsItem>
                <FormLabel>Version</FormLabel>
                <DetailsValue>{data?.version ?? "—"}</DetailsValue>
              </DetailsItem>

              <DetailsItem>
                <FormLabel>Mode</FormLabel>
                <DetailsValue>{data?.mode ?? "—"}</DetailsValue>
              </DetailsItem>

              <DetailsItem>
                <FormLabel>Runtime</FormLabel>
                <DetailsValue>{data?.runtime ?? "—"}</DetailsValue>
              </DetailsItem>

              <DetailsItem>
                <FormLabel>Time</FormLabel>
                <DetailsValue>
                  {data?.time ? formatDateTime(data.time) : "—"}
                </DetailsValue>
              </DetailsItem>

              <DetailsItem>
                <FormLabel>
                  Uptime since{" "}
                  {data?.uptime?.since
                    ? formatDateTime(data.uptime.since)
                    : "—"}
                </FormLabel>
                <DetailsValue>
                  {data?.uptime
                    ? formatDuration(data.uptime.milliseconds)
                    : "—"}
                </DetailsValue>
              </DetailsItem>
            </DetailsGrid>
          </CardBody>
        </CardContainer>

        <CardContainer>
          <CardHeader>
            <CardTitle>SOARCA GUI information</CardTitle>
          </CardHeader>
          <CardBody>
            <DetailsGrid>
              <DetailsItem>
                <FormLabel>Version</FormLabel>
                <DetailsValue>{__APP_VERSION__}</DetailsValue>
              </DetailsItem>
              <CreditsEasterEgg />
            </DetailsGrid>
          </CardBody>
        </CardContainer>
      </Spacer>
    </SuspenseCard>
  );
};
