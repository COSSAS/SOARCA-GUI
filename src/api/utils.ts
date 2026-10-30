import { getAccessToken } from "@/auth/oidc";
import { ErrorResponse } from "@/types";
import { PATHS } from "@/utils";

const statusMessages: Partial<Record<number, string>> = {
  401: "Please sign in again.",
  403: "You do not have access to this resource.",
  429: "Too many requests. Wait a moment and try again.",
};

// A full page load clears data cached for the previous user.
export function redirectToLogin(reason?: "expired") {
  const params = new URLSearchParams({
    return_to: location.pathname + location.search + location.hash,
  });
  if (reason) params.set("reason", reason);
  window.location.assign(`${PATHS.LOGIN}?${params}`);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly details: ErrorResponse,
  ) {
    super(details.message);
    this.name = "ApiError";
  }
}

export function shouldRetryApiRequest(failures: number, error: unknown) {
  return (
    !(error instanceof ApiError && [401, 403].includes(error.status)) &&
    failures < 3
  );
}

export async function requestFromApi<T>(
  url: string,
  init: RequestInit = {},
  readBody = true,
): Promise<T> {
  const headers = new Headers(init.headers);
  const token = await getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch {
    throw new ApiError(0, {
      status: 0,
      "original-call": url,
      message:
        "Could not connect to SOARCA. Check your connection and try again.",
    });
  }
  if (res.ok && (!readBody || res.status === 204 || res.status === 205)) {
    return undefined as T;
  }
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    if (res.ok) {
      throw new ApiError(502, {
        status: 502,
        "original-call": url,
        message: "SOARCA returned an unreadable response. Please try again.",
      });
    }
  }
  if (res.ok) return body as T;

  if (res.status === 401 && !url.startsWith("/api/auth/")) {
    redirectToLogin("expired");
  }
  const details = (typeof body === "object" && body) || {};
  let message = "The request could not be completed. Please try again.";
  if (res.status >= 500) {
    message = "SOARCA could not complete the request. Please try again later.";
  } else if ("message" in details && typeof details.message === "string") {
    message = details.message;
  }
  throw new ApiError(res.status, {
    "original-call": url,
    status: res.status,
    message: statusMessages[res.status] || message,
  });
}

export function fetchFromApi<T>(url: string): Promise<T> {
  return requestFromApi<T>(url);
}

export const enum HttpMutationMethod {
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
}

export function mutationToApi<T>(
  method: HttpMutationMethod,
  url: string,
  body: Record<string, unknown>,
): Promise<T> {
  return requestFromApi<T>(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function deleteToApi(url: string): Promise<void> {
  return requestFromApi<void>(url, { method: "DELETE" }, false);
}

export const getErrorFromApiResponse = (error: unknown): ErrorResponse =>
  error instanceof ApiError ? error.details : ({} as ErrorResponse);

export const formatErrorForToast = (
  error: unknown,
  defaultMessage: string,
): string => {
  const parsed = getErrorFromApiResponse(error);
  return `${parsed.status || "Error"}: ${parsed.message || defaultMessage}`;
};
