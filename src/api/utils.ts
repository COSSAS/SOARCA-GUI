import { ErrorResponse } from "@/types";

/**
 * Fetches from the API and handles errors uniformly.
 * @param url - API endpoint URL
 * @returns Parsed JSON response
 * @throws Error with parsed ErrorResponse if the response is not ok
 */
export async function fetchFromApi<T>(url: string): Promise<T> {
  const res = await fetch(url);

  if (!res.ok) {
    const parsed = (await res.json()) as ErrorResponse;
    throw new Error(JSON.stringify(parsed));
  }
  return res.json() as T;
}

export const enum HttpMutationMethod {
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
}

/**
 * Sends data to the API using the specified method and handles errors uniformly.
 * @param method - HTTP method (POST, PUT, PATCH) @see HttpMutationMethod.
 * @param url - API endpoint URL
 * @param body - Request body as a record
 * @returns Parsed JSON response
 * @throws Error with parsed ErrorResponse if the response is not ok
 */
export async function mutationToApi<T>(
  method: HttpMutationMethod,
  url: string,
  body: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const parsed = (await res.json()) as ErrorResponse;
    throw new Error(JSON.stringify(parsed));
  }
  const result = (await res.json()) as T;
  return result;
}

/**
 * Deletes a resource at the specified URL and handles errors uniformly.
 * @param url - API endpoint URL
 * @throws Error with parsed ErrorResponse if the response is not ok
 * @example
 * await deleteToApi('/api/resource/1');
 */
export async function deleteToApi(url: string): Promise<void> {
  const res = await fetch(url, {
    method: "DELETE",
  });

  if (!res.ok) {
    const parsed = (await res.json()) as ErrorResponse;
    throw new Error(JSON.stringify(parsed));
  }
}

/**
 * This utility function attempts to parse an Error object's message
 * as an ErrorResponse. If parsing fails, it returns an empty ErrorResponse object.
 * @param error - The Error object to parse
 * @returns Parsed ErrorResponse or an empty ErrorResponse object
 * @example
 * const errorResponse = apiErrorToErrorResponse(error);
 */
export const getErrorFromApiResponse = (error: Error): ErrorResponse => {
  if (error && error instanceof Error) {
    try {
      return JSON.parse(error.message) as ErrorResponse;
    } catch {
      return {} as ErrorResponse;
    }
  }
  return {} as ErrorResponse;
};

/**
 * Formats an error for display in a toast notification.
 * @param error - The Error object to format
 * @param defaultMessage - The default message to use if the error does not have a specific message
 * @returns Formatted error message string
 * @example
 * const message = formatErrorForToast(error, "An unexpected error occurred.");
 */
export const formatErrorForToast = (
  error: Error,
  defaultMessage: string,
): string => {
  const parsed = getErrorFromApiResponse(error);
  return `${parsed.status || "Error"}: ${parsed.message || defaultMessage}`;
};
