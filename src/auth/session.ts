import { getPrincipal } from "@/api/auth";
import { getProfile } from "@/auth/oidc";
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
