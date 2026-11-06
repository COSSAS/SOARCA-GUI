import {
  IconBrandOauth,
  IconBrandWindows,
  IconLockOpen2,
  type TablerIcon,
} from "@tabler/icons-react";
import { PATHS } from "@/utils";

// The names a provider's "icon" field in auth-config.json accepts.
export const providerIcons = {
  microsoft: IconBrandWindows,
  authentik: IconBrandOauth,
  lock: IconLockOpen2,
} satisfies Record<string, TablerIcon>;

export type ProviderIcon = keyof typeof providerIcons;

export const isProviderIcon = (value: unknown): value is ProviderIcon =>
  typeof value === "string" && Object.hasOwn(providerIcons, value);

// The login page shows these for the "error" query parameter.
export const signInErrors = {
  sign_in_failed:
    "We could not complete your sign-in. Please try again. If the problem continues, contact your administrator.",
  sign_in_denied:
    "Sign-in was cancelled or not allowed. Try again, or contact your administrator if you need access.",
  provider_unavailable:
    "The login provider is temporarily unavailable. Please try again later.",
  secure_context_required:
    "Sign-in requires HTTPS. Use localhost for local development.",
  provider_sign_out_failed:
    "You are signed out of SOARCA, but the login provider could not be reached to end its session. It may sign you in again without asking.",
};

export type SignInError = keyof typeof signInErrors;

// Unknown codes get the generic message.
export const signInErrorMessage = (code: string) =>
  signInErrors[
    Object.hasOwn(signInErrors, code) ? (code as SignInError) : "sign_in_failed"
  ];

export function loginUrl(
  options: { returnTo?: string; error?: SignInError; reason?: "expired" } = {},
) {
  const params = new URLSearchParams();
  if (options.returnTo) params.set("return_to", options.returnTo);
  if (options.error) params.set("error", options.error);
  if (options.reason) params.set("reason", options.reason);
  const query = params.toString();
  return query ? `${PATHS.LOGIN}?${query}` : PATHS.LOGIN;
}
