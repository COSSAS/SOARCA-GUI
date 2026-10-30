import { ApiError, fetchFromApi } from "@/api/utils";
import type { AuthConfig, CurrentUser } from "@/types";

export const getAuthConfig = () => fetchFromApi<AuthConfig>("/api/auth/config");

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    return await fetchFromApi<CurrentUser>("/api/auth/me");
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
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
