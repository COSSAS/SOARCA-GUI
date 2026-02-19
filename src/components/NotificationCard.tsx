import styled from "styled-components";
import { ThemeVariant, getVariantColors } from "./utils";

export interface NotificationCardProps extends React.HTMLAttributes<HTMLDivElement> {
  $variant?: ThemeVariant;
  children: React.ReactNode;
}

/**
 * NotificationCard component for displaying themed alert messages and notifications.
 * Provides colored backgrounds, borders, and text using the same variants as Badge for visual consistency.
 * Useful for inline status messages, alerts, or informational blocks within the application.
 * @param $variant - Visual variant using ThemeVariant enum. Defaults to Info.
 * @param children - Content to render inside the notification card. Can be text, elements, or complex components.
 * @example
 * // Success notification
 * <NotificationCard $variant={ThemeVariant.Success}>
 *   <strong>Success!</strong> Operation completed successfully.
 * </NotificationCard>
 * @example
 * // Error notification with multiple elements
 * <NotificationCard $variant={ThemeVariant.Error}>
 *   <h4>Error</h4>
 *   <p>Something went wrong. Please try again.</p>
 * </NotificationCard>
 * @example
 * // Info notification (default)
 * <NotificationCard>
 *   <p>This is an informational message.</p>
 * </NotificationCard>
 */
export const NotificationCard = styled.div<NotificationCardProps>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};

  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid
    ${({ $variant = ThemeVariant.Info, theme }) =>
      getVariantColors(theme, $variant).border};

  background: ${({ $variant = ThemeVariant.Info, theme }) =>
    getVariantColors(theme, $variant).bg};
  color: ${({ $variant = ThemeVariant.Info, theme }) =>
    getVariantColors(theme, $variant).text};

  font: ${({ theme }) => theme.typography.body.font};
`;
