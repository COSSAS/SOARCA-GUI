import { useQuery } from "@tanstack/react-query";
import { css, styled } from "styled-components";

import { getPingStatus } from "@/api/status";
import { getVariantColors, ThemeVariant } from "@/components/utils";
import { theme } from "@/theme";
import { pulse } from "@/theme/animations";

export const StatusIndicator: React.FC = () => {
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
    refetchOnWindowFocus: true,
  });

  const isOnline = status === "success" && !isError && data === "pong";
  const isReconnecting = isFetching && !isOnline;

  return (
    <StatusDot
      className="status-indicator" // needed to swap the order when in mobile view. See Main.tsx
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
  $isOnline: boolean;
  $isReconnecting: boolean;
}>`
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: ${({ theme }) => theme.radius.full};

  background-color: ${({ $isOnline, $isReconnecting }) =>
    $isOnline
      ? getVariantColors(theme, ThemeVariant.Success).solidBg
      : $isReconnecting
        ? getVariantColors(theme, ThemeVariant.Warning).solidBg
        : getVariantColors(theme, ThemeVariant.Error).solidBg};

  animation: ${({ $isOnline, $isReconnecting }) =>
    $isOnline || $isReconnecting
      ? css`
          ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        `
      : "none"};
`;
