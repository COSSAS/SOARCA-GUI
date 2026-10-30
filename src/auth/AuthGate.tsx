import type { PropsWithChildren } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/auth/AuthContext";
import type { Permission } from "@/auth/permissions";
import {
  Button,
  CardTitle,
  CenteredCardContent,
  Link,
  NotificationCard,
  Spacer,
  Spinner,
  Text,
  ThemeVariant,
} from "@/components";
import { PATHS } from "@/utils";

export function RequirePermission({
  permission,
  children,
}: PropsWithChildren<{ permission: Permission }>) {
  const { can } = useAuth();
  return can(permission) ? children : null;
}

export function AuthStatus() {
  const auth = useAuth();
  return (
    <Spacer $direction="vertical" $gap="md" $align="center">
      {auth.isLoading ? (
        <Spinner role="status" aria-label="Checking your session" />
      ) : (
        <NotificationCard $variant={ThemeVariant.Error} role="alert">
          <CardTitle>Sign-in unavailable</CardTitle>
          <Text>
            We could not check your sign-in status. Please try again. If the
            problem continues, contact your administrator.
          </Text>
          <Button onClick={auth.retry}>Try again</Button>
        </NotificationCard>
      )}
    </Spacer>
  );
}

export function AuthGate() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.isLoading || auth.isError) {
    return (
      <CenteredCardContent>
        <AuthStatus />
      </CenteredCardContent>
    );
  }
  if (!auth.user) {
    const returnTo = location.pathname + location.search + location.hash;
    return (
      <Navigate
        to={`${PATHS.LOGIN}?${new URLSearchParams({ return_to: returnTo })}`}
        replace
      />
    );
  }
  return <Outlet />;
}

export function PermissionGate({ permission }: { permission: Permission }) {
  const { can } = useAuth();
  if (can(permission)) return <Outlet />;
  return (
    <NotificationCard $variant={ThemeVariant.Error} role="alert">
      <CardTitle>Access denied</CardTitle>
      <Text>
        You do not have permission to view this page. Contact your administrator
        if you need access.
      </Text>
      <Link $to={PATHS.BASE}>Go to home</Link>
    </NotificationCard>
  );
}
