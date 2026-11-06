import { ErrorResponse } from "oidc-client-ts";
import { getPrincipal, safeReturnPath } from "@/api/auth";
import { loginUrl, type SignInError } from "@/auth/login";
import {
  clearSignIn,
  completeSignIn,
  getProfile,
  takeReturnPath,
} from "@/auth/oidc";
import type { SessionUser } from "@/types";

export interface Session {
  user: SessionUser | null;
  noAccess: boolean;
}

export async function loadSession(): Promise<Session> {
  const result = await getPrincipal();
  if (result.status !== "authenticated") {
    return { user: null, noAccess: result.status === "forbidden" };
  }
  // SOARCA reports this provider only when authentication is disabled.
  const anonymous = result.principal.provider === "anonymous";
  const user: SessionUser = {
    ...result.principal,
    anonymous,
    ...(anonymous ? {} : await getProfile()),
  };
  return { user, noAccess: false };
}

// Finishes the sign-in on /login/callback and resolves to where the user goes
// next: the page they started from, or the login page with an error.
export async function finishSignIn(): Promise<string> {
  const returnTo = safeReturnPath(takeReturnPath());
  let error: SignInError = "sign_in_failed";
  try {
    await completeSignIn();
    // The provider signed the user in, but SOARCA may still reject the token.
    // A valid token without a SOARCA role continues to the no-access screen.
    if ((await getPrincipal()).status !== "signed-out") return returnTo;
    await clearSignIn();
  } catch (err) {
    if (err instanceof ErrorResponse && err.error === "access_denied") {
      error = "sign_in_denied";
    }
  }
  return loginUrl({ returnTo, error });
}
