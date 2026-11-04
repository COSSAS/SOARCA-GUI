import { useQuery } from "@tanstack/react-query";
import React from "react";

import { getSystemStatus } from "@/api/status";
import { useAuth } from "@/auth/AuthContext";
import { Permissions } from "@/auth/permissions";
import {
  Badge,
  CardBody,
  CardContainer,
  CardHeader,
  CardTitle,
  CenteredCardContent,
  DetailsGrid,
  DetailsItem,
  DetailsValue,
  FormLabel,
  NotificationCard,
  RadioGroup,
  Spacer,
  Spinner,
  Text,
  ThemeSize,
  ThemeVariant,
} from "@/components";
import { ThemeMode, useThemeMode } from "@/theme";
import { formatDateTime, formatDuration } from "@/utils";
import { CreditsEasterEgg } from "./Credits";
import { AccountDetails } from "./AccountDetails";

export const SettingsPage: React.FC = () => {
  const { user, can } = useAuth();
  const canReadStatus = can(Permissions.StatusRead);
  const { mode, setMode } = useThemeMode();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["system-status"],
    queryFn: getSystemStatus,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
    enabled: canReadStatus,
  });

  return (
    <Spacer $direction="vertical" $gap="lg">
      {user && (
        <CardContainer>
          <CardHeader>
            <CardTitle>Your account</CardTitle>
          </CardHeader>
          <CardBody>
            {user.anonymous ? (
              <Spacer $direction="vertical" $align="start">
                <NotificationCard $variant={ThemeVariant.Warning} role="status">
                  Sign-in is turned off on this SOARCA server. Everyone who can
                  reach this GUI has full access, without signing in.
                </NotificationCard>
              </Spacer>
            ) : (
              <DetailsGrid>
                <AccountDetails user={user} detailed />
              </DetailsGrid>
            )}
          </CardBody>
        </CardContainer>
      )}
      <CardContainer>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardBody>
          <DetailsGrid>
            <DetailsItem>
              <FormLabel>Theme</FormLabel>
              <RadioGroup
                name="theme-mode"
                $options={[
                  { label: "Automatic", value: "auto" },
                  { label: "Light", value: "light" },
                  { label: "Dark (Beta)", value: "dark" },
                ]}
                $value={mode}
                $onChange={(v) => setMode(v as ThemeMode)}
              />
            </DetailsItem>
          </DetailsGrid>
        </CardBody>
      </CardContainer>
      <CardContainer>
        <CardHeader>
          <CardTitle>SOARCA information</CardTitle>
        </CardHeader>
        <CardBody>
          {!canReadStatus ? (
            <Text>Your account cannot view SOARCA status details.</Text>
          ) : isLoading ? (
            <CenteredCardContent>
              <Spinner $size={ThemeSize.Medium} />
            </CenteredCardContent>
          ) : (
            <DetailsGrid>
              <DetailsItem>
                <FormLabel>Status</FormLabel>
                <DetailsValue>
                  <Badge
                    $variant={
                      isError ? ThemeVariant.Error : ThemeVariant.Success
                    }
                  >
                    {isError ? "Offline" : "Online"}
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
          )}
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
  );
};
