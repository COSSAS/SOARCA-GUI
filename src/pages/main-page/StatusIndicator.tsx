import { useQuery } from "@tanstack/react-query";
import { css, styled } from "styled-components";

import { getPingStatus } from "@/api/status";
import { getVariantColors, ThemeVariant } from "@/components/utils";
import { theme } from "@/theme";
import { pulse } from "@/theme/animations";

export const StatusIndicator: React.FC<{ collapsed: boolean }> = ({
  collapsed,
}) => {
  const { data, isError, status, isFetching } = useQuery({
    queryKey: ["pingStatus"],
    queryFn: async () => {
      try {
        const response = await getPingStatus();
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.text();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to ping backend";
        throw new Error(errorMessage);
      }
    },
    retry: 1,
    retryDelay: 500,
    refetchInterval: 5000,
  });

  const isOnline = status === "success" && !isError && data === "pong";
  const isReconnecting = isFetching && !isOnline;

  return (
    <StatusDot
      $collapsed={collapsed}
      $isOnline={isOnline}
      $isReconnecting={isReconnecting}
      title={
        isOnline
          ? "Connected to SOARCA!"
          : isReconnecting
            ? "Reconnecting to SOARCA..."
            : "We lost contact with SOARCA!"
      }
    />
  );
};

const StatusDot = styled.div<{
  $collapsed: boolean;
  $isOnline: boolean;
  $isReconnecting: boolean;
}>`
  position: absolute;
  top: ${({ $collapsed }) => ($collapsed ? "-0.25rem" : "50%")};
  right: ${({ $collapsed }) => ($collapsed ? "auto" : "0")};
  left: ${({ $collapsed }) => ($collapsed ? "0" : "auto")};
  transform: ${({ $collapsed }) => ($collapsed ? "none" : "translateY(-50%)")};

  width: ${({ $collapsed }) => ($collapsed ? "2.5rem" : "10px")};
  height: ${({ $collapsed }) => ($collapsed ? "2.5rem" : "10px")};
  border: ${({ $collapsed }) => ($collapsed ? "2px solid currentColor" : "0")};
  border-radius: ${({ theme }) => theme.radius.full};

  color: ${({ $isOnline, $isReconnecting }) =>
    $isOnline
      ? getVariantColors(theme, ThemeVariant.Success).solidBg
      : $isReconnecting
        ? getVariantColors(theme, ThemeVariant.Warning).solidBg
        : getVariantColors(theme, ThemeVariant.Error).solidBg};

  background-color: ${({ $collapsed }) =>
    $collapsed ? "transparent" : "currentColor"};

  ${({ $isOnline, $isReconnecting }) =>
    ($isOnline || $isReconnecting) &&
    css`
      animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    `}
`;
