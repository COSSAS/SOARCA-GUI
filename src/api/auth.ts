import { ApiError, fetchFromApi, PRINCIPAL_URL } from "@/api/utils";
import type { PrincipalPermissions } from "@/types";

export type PrincipalResult =
  | { status: "authenticated"; principal: PrincipalPermissions }
  | { status: "signed-out" }
  // Signed in, but the account has no SOARCA role.
  | { status: "forbidden" };

export async function getPrincipal(): Promise<PrincipalResult> {
  try {
    const principal = await fetchFromApi<PrincipalPermissions>(PRINCIPAL_URL);
    return { status: "authenticated", principal };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401)
      return { status: "signed-out" };
    if (error instanceof ApiError && error.status === 403)
      return { status: "forbidden" };
    throw error;
  }
}

// Same-origin app path only, so sign-in can't redirect anywhere else.
export function safeReturnPath(value: string | null): string {
  try {
    const url = new URL(value ?? "/", location.origin);
    if (
      url.origin !== location.origin ||
      /^\/(api|login)(\/|$)/.test(url.pathname)
    ) {
      return "/";
    }
    return url.pathname + url.search + url.hash;
  } catch {
    return "/";
  }
}
