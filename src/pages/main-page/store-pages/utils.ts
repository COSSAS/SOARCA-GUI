import { matchPath } from "react-router";

import { Permissions } from "@/auth/permissions";
import { parseDate, PATHS } from "@/utils";

/** The tabs of the Resources page. Each has its own URL and permission. */
export const RESOURCE_TABS = [
  {
    path: PATHS.VARIABLES,
    label: "Variables",
    permission: Permissions.VariableRead,
  },
  { path: PATHS.SECRETS, label: "Secrets", permission: Permissions.SecretRead },
] as const;

export const resourceTabAt = (pathname: string) =>
  RESOURCE_TABS.find((tab) => matchPath(tab.path, pathname));

/** Allowed secret and variable names, from the SOARCA API design. */
export const NAME_PATTERN = /^[a-z0-9][a-z0-9_.-]{0,127}$/;

/** `identity--8a3e0f52-...` becomes `8a3e0f52`, enough to tell users apart. */
export const shortIdentity = (identity: string) =>
  identity.replace(/^identity--/, "").slice(0, 8);

export const formatStoreDate = (value: string) =>
  parseDate(value)?.toLocaleDateString("en-GB") || value || "—";

export const matchesSearch = (search: string, ...fields: string[]) => {
  const needle = search.trim().toLowerCase();
  return !needle || fields.some((f) => f.toLowerCase().includes(needle));
};
