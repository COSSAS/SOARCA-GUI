import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, type PropsWithChildren } from "react";
import toast from "react-hot-toast";
import { redirectToLogin } from "@/api/utils";
import { AuthContext } from "@/auth/AuthContext";
import { signOut } from "@/auth/oidc";
import { loadSession } from "@/auth/session";

export function AuthProvider({ children }: PropsWithChildren) {
  const session = useQuery({
    queryKey: ["auth", "session"],
    queryFn: loadSession,
    retry: false,
    staleTime: 30_000,
  });
  const data = session.data;
  const user = data?.user;

  useEffect(() => {
    if (session.isRefetchError) {
      toast.error("Could not check your session. Your page is unchanged.", {
        id: "session-check",
      });
    }
  }, [session.isRefetchError]);

  // A refetch that returns a different (or no) user means the session changed
  // elsewhere; reload so nothing cached for the old user survives.
  const identity = user ? `${user.provider}:${user.subject}` : null;
  const signedInAs = useRef<string | null>(null);
  useEffect(() => {
    if (signedInAs.current && signedInAs.current !== identity)
      redirectToLogin("expired");
    else signedInAs.current = identity;
  }, [identity]);

  return (
    <AuthContext.Provider
      value={{
        user,
        noAccess: data?.noAccess ?? false,
        isLoading: session.isLoading,
        // Only the initial check blocks; a failed background refetch keeps the cached user.
        isError: session.isLoadingError,
        can: (permission) => user?.permissions.includes(permission) ?? false,
        logout: () =>
          void signOut().then(
            (url) => window.location.assign(url),
            () =>
              toast.error("Could not sign you out. Please try again.", {
                id: "sign-out",
              }),
          ),
        retry: () => void session.refetch(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
