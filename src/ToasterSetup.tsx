import { theme } from "@/theme";
import { Check, XCircle } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { Icon } from "./components/Icon";

/**
 * ToasterSetup component to configure and display toast notifications.
 */
export const ToasterSetup: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: theme.toasterDuration.info,
        style: {
          font: theme.typography.bodyMedium.font,
          border: `1px solid ${theme.colors.border.light}`,
          borderRadius: theme.radius.md,
          boxShadow: theme.shadows.md,
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        },
        success: {
          duration: theme.toasterDuration.success,
          style: {
            borderColor: theme.colors.success.border,
            background: theme.colors.success.solidBg,
            color: theme.colors.success.solidText,
          },
          icon: <Icon $icon={Check} $round $ghost />,
        },
        error: {
          duration: theme.toasterDuration.error,
          style: {
            borderColor: theme.colors.error.border,
            background: theme.colors.error.solidBg,
            color: theme.colors.error.solidText,
          },
          icon: <Icon $icon={XCircle} $round $ghost />,
        },
      }}
    />
  );
};
