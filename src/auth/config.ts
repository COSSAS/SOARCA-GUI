import { isProviderIcon, providerIcons } from "@/auth/login";
import type { SignInProvider } from "@/types";

const nonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim() !== "";

function isHttpUrl(value: string) {
  try {
    return /^https?:$/.test(new URL(value).protocol);
  } catch {
    return false;
  }
}

function parseProvider(value: unknown, index: number): SignInProvider {
  const where = `providers[${index}]`;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${where} must be an object`);
  }
  const {
    id,
    label,
    issuer,
    client_id,
    scopes = [],
    icon = "lock",
  } = value as Record<string, unknown>;
  if (!nonEmptyString(id)) throw new Error(`${where}.id is required`);
  if (!nonEmptyString(label)) throw new Error(`${where}.label is required`);
  if (typeof issuer !== "string" || !isHttpUrl(issuer)) {
    throw new Error(`${where}.issuer must be an http(s) URL`);
  }
  if (!nonEmptyString(client_id)) {
    throw new Error(`${where}.client_id is required`);
  }
  if (!Array.isArray(scopes) || !scopes.every(nonEmptyString)) {
    throw new Error(`${where}.scopes must be a list of scopes`);
  }
  if (!isProviderIcon(icon)) {
    throw new Error(
      `${where}.icon must be one of: ${Object.keys(providerIcons).join(", ")}`,
    );
  }
  return {
    id,
    label,
    issuer,
    client_id,
    scopes,
    icon,
  };
}

function parseAuthConfig(value: unknown): SignInProvider[] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("the file must contain a JSON object");
  }
  const { providers } = value as Record<string, unknown>;
  if (!Array.isArray(providers) || providers.length === 0) {
    throw new Error("providers must be a non-empty list");
  }
  const parsed = providers.map(parseProvider);
  const ids = new Set<string>();
  for (const provider of parsed) {
    if (ids.has(provider.id)) {
      throw new Error(`provider id "${provider.id}" is used twice`);
    }
    ids.add(provider.id);
  }
  return parsed;
}

export async function loadAuthConfig(): Promise<SignInProvider[]> {
  let res: Response;
  try {
    res = await fetch("/auth-config.json", { cache: "no-store" });
  } catch {
    throw new Error("auth-config.json could not be loaded");
  }
  if (res.status === 404) throw new Error("auth-config.json is not deployed");
  if (!res.ok) {
    throw new Error(
      `auth-config.json could not be loaded (HTTP ${res.status})`,
    );
  }
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error("auth-config.json is not valid JSON");
  }
  return parseAuthConfig(body);
}
