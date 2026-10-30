import {
  IconArrowRight,
  IconBrandWindows,
  IconLockOpen2,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "oidc-client-ts";
import { useEffect, useState } from "react";
import { Navigate, useMatch, useSearchParams } from "react-router";
import styled from "styled-components";

import { getCurrentUser, safeReturnPath } from "@/api/auth";
import soarcaBackground from "@/assets/soarca-background.jpg";
import logoDark from "@/assets/soarca-logo-cropped-dark.svg";
import logo from "@/assets/soarca-logo-cropped.svg";
import { useAuth } from "@/auth/AuthContext";
import { AuthStatus } from "@/auth/AuthGate";
import { completeSignIn, signIn, signOut } from "@/auth/oidc";

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

const signInErrors: Record<string, string> = {
  sign_in_denied:
    "Sign-in was cancelled or not allowed. Try again, or contact your administrator if you need access.",
  provider_unavailable:
    "The login provider is temporarily unavailable. Please try again later.",
};

export const LoginPage: React.FC = () => {
  const { resolved } = useThemeMode();
  const auth = useAuth();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const returnTo = safeReturnPath(params.get("return_to"));
  const signInError = params.get("error");
  const isCallback = useMatch(PATHS.LOGIN_CALLBACK) !== null;

  const callback = useQuery({
    queryKey: ["auth", "callback"],
    queryFn: async () => {
      const path = await completeSignIn();
      // The provider signed the user in, but SOARCA may still reject the token.
      if (!(await getCurrentUser())) {
        await signOut();
        throw new Error("SOARCA rejected the sign-in");
      }
      await queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      return safeReturnPath(path);
    },
    enabled: isCallback,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    const resetPending = () => setPendingProvider(null);
    window.addEventListener("pageshow", resetPending);
    return () => window.removeEventListener("pageshow", resetPending);
  }, []);

  const startSignIn = (provider: SignInProvider) => {
    if (pendingProvider) return;
    setPendingProvider(provider.issuer);
    signIn(provider, returnTo).catch(() => {
      setPendingProvider(null);
      setParams(
        { return_to: returnTo, error: "provider_unavailable" },
        { replace: true },
      );
    });
  };

  if (isCallback) {
    if (callback.isSuccess) return <Navigate to={callback.data} replace />;
    if (callback.isError) {
      const denied =
        callback.error instanceof ErrorResponse &&
        callback.error.error === "access_denied";
      const error = denied ? "sign_in_denied" : "sign_in_failed";
      return <Navigate to={`${PATHS.LOGIN}?error=${error}`} replace />;
    }
  } else if (auth.user) {
    return <Navigate to={returnTo} replace />;
  }
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
          <ProviderPrompt>Choose a login provider</ProviderPrompt>
          <ProviderOptions>
            {isCallback ? (
              <Spacer $direction="vertical" $align="center">
                <Spinner role="status" aria-label="Signing in" />
              </Spacer>
            ) : auth.isLoading || auth.isError ? (
              <AuthStatus />
            ) : (
              <FormContainer>
                {signInError !== null && (
                  <NotificationCard $variant={ThemeVariant.Error} role="alert">
                    {Object.hasOwn(signInErrors, signInError)
                      ? signInErrors[signInError]
                      : "We could not complete your sign-in. Please try again. If the problem continues, contact your administrator."}
                  </NotificationCard>
                )}
                {params.get("reason") === "expired" && (
                  <NotificationCard
                    $variant={ThemeVariant.Warning}
                    role="status"
                  >
                    Your session has ended. Select a provider to sign in again.
                  </NotificationCard>
                )}
                {auth.config?.providers.length ? (
                  auth.config.providers.map((provider) => (
                    <ProviderButton
                      key={provider.issuer}
                      type="button"
                      $fullWidth
                      disabled={pendingProvider !== null}
                      aria-busy={pendingProvider === provider.issuer}
                      onClick={() => startSignIn(provider)}
                    >
                      <ProviderIdentity>
                        <Icon
                          $icon={
                            provider.id === "entra"
                              ? IconBrandWindows
                              : IconLockOpen2
                          }
                        />
                        <span>
                          {provider.id === "entra"
                            ? "Microsoft Entra"
                            : "Single sign-on"}
                        </span>
                      </ProviderIdentity>
                      {pendingProvider === provider.issuer ? (
                        <Spinner
                          role="status"
                          aria-label="Redirecting to sign in"
                        />
                      ) : (
                        <Icon
                          $icon={IconArrowRight}
                          className="provider-arrow"
                          aria-hidden="true"
                        />
                      )}
                    </ProviderButton>
                  ))
                ) : (
                  <NotificationCard
                    $variant={ThemeVariant.Warning}
                    role="status"
                  >
                    Sign-in is currently unavailable. Please try again later or
                    contact your administrator.
                  </NotificationCard>
                )}
              </FormContainer>
            )}
          </ProviderOptions>
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

  &:is(:hover, :focus-visible):not(:disabled) .provider-arrow {
    opacity: 1;
    transform: translateX(0);
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
