import { IconArrowRight } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useMatch, useSearchParams } from "react-router";
import styled from "styled-components";

import { safeReturnPath } from "@/api/auth";
import soarcaBackground from "@/assets/soarca-background.jpg";
import logoDark from "@/assets/soarca-logo-cropped-dark.svg";
import logo from "@/assets/soarca-logo-cropped.svg";
import { useAuth, type AuthState } from "@/auth/AuthContext";
import { AuthStatus, NoAccess } from "@/auth/AuthGate";
import { loadAuthConfig } from "@/auth/config";
import {
  providerIcons,
  signInErrorMessage,
  type SignInError,
} from "@/auth/login";
import { signIn } from "@/auth/oidc";
import { finishSignIn } from "@/auth/session";

import {
  Button,
  FormContainer,
  Icon,
  ImageContainer,
  NotificationCard,
  PageContainer,
  Spacer,
  Spinner,
  Text,
  ThemeVariant,
} from "@/components";
import { useThemeMode } from "@/theme";
import type { SignInProvider } from "@/types";
import { PATHS } from "@/utils";

type LoginView =
  | "callback"
  | "session"
  | "noAccess"
  | "loadingProviders"
  | "configError"
  | "providers";

function loginView(
  isCallback: boolean,
  auth: AuthState,
  config: { data?: unknown; isError: boolean },
): LoginView {
  if (isCallback) return "callback";
  if (auth.isLoading || auth.isError) return "session";
  if (auth.noAccess) return "noAccess";
  if (config.data) return "providers";
  return config.isError ? "configError" : "loadingProviders";
}

export const LoginPage: React.FC = () => {
  const { resolved } = useThemeMode();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const returnTo = safeReturnPath(params.get("return_to"));
  const signInError = params.get("error");
  const isCallback = useMatch(PATHS.LOGIN_CALLBACK) !== null;

  // finishSignIn never rejects; every failure resolves to a login URL.
  const callback = useQuery({
    queryKey: ["auth", "callback"],
    queryFn: async () => {
      const target = await finishSignIn();
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      return target;
    },
    enabled: isCallback,
    retry: false,
    staleTime: Infinity,
  });

  const config = useQuery({
    queryKey: ["auth", "config"],
    queryFn: loadAuthConfig,
    enabled: !isCallback && !auth.isLoading && !auth.user && !auth.noAccess,
    retry: false,
  });

  useEffect(() => {
    const resetPending = () => setPendingProvider(null);
    window.addEventListener("pageshow", resetPending);
    return () => window.removeEventListener("pageshow", resetPending);
  }, []);

  const startSignIn = (provider: SignInProvider) => {
    if (pendingProvider) return;
    setPendingProvider(provider.id);
    signIn(provider, returnTo).catch(() => {
      setPendingProvider(null);
      const error: SignInError = "provider_unavailable";
      setParams({ return_to: returnTo, error }, { replace: true });
    });
  };

  if (isCallback) {
    if (callback.isSuccess) return <Navigate to={callback.data} replace />;
  } else if (auth.user) {
    return <Navigate to={returnTo} replace />;
  }

  const view = loginView(isCallback, auth, config);

  const withNotices = (content: ReactNode) => (
    <FormContainer>
      {signInError !== null && (
        <NotificationCard $variant={ThemeVariant.Error} role="alert">
          {signInErrorMessage(signInError)}
        </NotificationCard>
      )}
      {params.get("reason") === "expired" && (
        <NotificationCard $variant={ThemeVariant.Warning} role="status">
          Your session has ended. Select a provider to sign in again.
        </NotificationCard>
      )}
      {content}
    </FormContainer>
  );

  const renderBody = () => {
    switch (view) {
      case "callback":
        return <CenteredSpinner role="status" aria-label="Signing in" />;
      case "session":
        return <AuthStatus />;
      case "noAccess":
        return <NoAccess />;
      case "loadingProviders":
        return (
          <CenteredSpinner role="status" aria-label="Loading login providers" />
        );
      case "configError":
        return withNotices(
          <NotificationCard $variant={ThemeVariant.Error} role="alert">
            Could not read the sign-in settings of this GUI:{" "}
            {config.error instanceof Error
              ? config.error.message
              : "unknown error"}
            . Contact your administrator.
          </NotificationCard>,
        );
      case "providers":
        return withNotices(
          <>
            {config.data?.map((provider) => (
              <ProviderButton
                key={provider.id}
                type="button"
                $fullWidth
                // aria-disabled instead of disabled keeps keyboard focus
                // on the clicked button; startSignIn ignores the clicks.
                aria-disabled={pendingProvider !== null}
                onClick={() => startSignIn(provider)}
              >
                <ProviderIdentity>
                  <Icon $icon={providerIcons[provider.icon]} />
                  <span>{provider.label}</span>
                </ProviderIdentity>
                {pendingProvider === provider.id ? (
                  <Spinner aria-hidden="true" />
                ) : (
                  <Icon
                    $icon={IconArrowRight}
                    className="provider-arrow"
                    aria-hidden="true"
                  />
                )}
              </ProviderButton>
            ))}
            <VisuallyHidden role="status">
              {pendingProvider !== null && "Redirecting to sign in"}
            </VisuallyHidden>
          </>,
        );
    }
  };

  return (
    <PageContainer $backgroundImage={soarcaBackground}>
      <LoginCard>
        <LoginCardHeader>
          <Spacer $gap="md" $align="center" $justify="center">
            <ImageContainer
              src={resolved === "dark" ? logoDark : logo}
              alt="SOARCA Logo"
            />
          </Spacer>
        </LoginCardHeader>
        <LoginCardBody>
          {view === "providers" && (
            <ProviderPrompt>Choose a login provider</ProviderPrompt>
          )}
          <ProviderOptions>{renderBody()}</ProviderOptions>
        </LoginCardBody>
      </LoginCard>
    </PageContainer>
  );
};
const LoginCard = styled.div`
  width: 100%;
  max-width: 28rem;
  overflow: hidden;

  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.background.primary};
  box-shadow: ${({ theme }) => theme.shadows.base};
`;

const LoginCardHeader = styled.div`
  padding: ${({ theme }) => theme.spacing["3xl"]}
    ${({ theme }) => theme.spacing.xl};

  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const LoginCardBody = styled.div`
  display: grid;
  align-content: start;
  gap: ${({ theme }) => theme.spacing.xl};

  min-height: 10rem;
  padding: ${({ theme }) => theme.spacing.xl};
`;

const ProviderPrompt = styled(Text)`
  font: ${({ theme }) => theme.typography.bodyMedium.font};
  text-align: center;
`;

const ProviderOptions = styled.div`
  display: grid;
  align-items: center;

  min-height: 2.125rem;
`;

const CenteredSpinner = styled(Spinner)`
  justify-self: center;
`;

const ProviderButton = styled(Button)`
  display: grid;
  grid-template-columns: 1.5rem minmax(0, 1fr) 1.5rem;

  > :last-child {
    grid-column: 3;
    justify-self: center;
  }

  .provider-arrow {
    opacity: 0;
    transform: translateX(-${({ theme }) => theme.spacing.xs});

    transition:
      opacity ${({ theme }) => theme.transitions.base},
      transform ${({ theme }) => theme.transitions.base};
  }

  &:is(:hover, :focus-visible):not([aria-disabled="true"]) .provider-arrow {
    opacity: 1;
    transform: translateX(0);
  }

  &[aria-disabled="true"] {
    opacity: ${({ theme }) => theme.interactions.disabledOpacity};
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .provider-arrow {
      transition: none;
      transform: none;
    }
  }
`;

const ProviderIdentity = styled.span`
  display: inline-flex;
  grid-column: 2;
  align-items: center;
  justify-content: center;
  gap: inherit;
`;

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;

  clip-path: inset(50%);
  white-space: nowrap;
`;
