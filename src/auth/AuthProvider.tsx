import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, type PropsWithChildren } from "react";
import toast from "react-hot-toast";
import { getAuthConfig, getCurrentUser } from "@/api/auth";
import { redirectToLogin } from "@/api/utils";
import { AuthContext } from "@/auth/AuthContext";
import { signOut } from "@/auth/oidc";
import { hasPermission } from "@/auth/permissions";
import { PATHS } from "@/utils";

export function AuthProvider({ children }: PropsWithChildren) {
  const session = useQuery({
    queryKey: ["auth", "session"],
    queryFn: async () => {
      const [config, user] = await Promise.all([
        getAuthConfig(),
        getCurrentUser(),
      ]);
      return { config, user };
    },
    retry: false,
    staleTime: 30_000,
  });
  const { config, user } = session.data ?? {};

  useEffect(() => {
    if (session.isRefetchError) {
      toast.error("Could not check your session. Your page is unchanged.", {
        id: "session-check",
      });
    }
  }, [session.isRefetchError]);

  // A refetch that returns a different (or no) user means the session changed
  // elsewhere; reload so nothing cached for the old user survives.
  const identity = user
    ? `${user.principal.provider}:${user.principal.subject}`
    : null;
  const signedInAs = useRef<string | null>(null);
  useEffect(() => {
    if (signedInAs.current && signedInAs.current !== identity)
      redirectToLogin("expired");
    else signedInAs.current = identity;
  }, [identity]);

  return (
    <AuthContext.Provider
      value={{
        config,
        user,
        isLoading: session.isLoading,
        // Only the initial check blocks; a failed background refetch keeps the cached user.
        isError: session.isLoadingError,
        can: (permission) => hasPermission(user?.principal, permission),
        logout: () =>
          void signOut().then(() => window.location.assign(PATHS.LOGIN)),
        retry: () => void session.refetch(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
