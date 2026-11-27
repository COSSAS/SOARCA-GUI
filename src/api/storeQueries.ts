import { queryOptions } from "@tanstack/react-query";

import {
  getSecretBackend,
  getSecrets,
  getSecretVersions,
  getVariables,
  getVariableVersions,
} from "./store";

/** Every component that reads the store uses these, so keys and caching match. */
export const storeQueries = {
  secretBackend: () =>
    queryOptions({ queryKey: ["secret-backend"], queryFn: getSecretBackend }),
  secrets: () => queryOptions({ queryKey: ["secrets"], queryFn: getSecrets }),
  secretVersions: (secret: string) =>
    queryOptions({
      queryKey: ["secret", secret, "versions"],
      queryFn: () => getSecretVersions(secret),
    }),
  variables: () =>
    queryOptions({ queryKey: ["variables"], queryFn: getVariables }),
  variableVersions: (variable: string) =>
    queryOptions({
      queryKey: ["variable", variable, "versions"],
      queryFn: () => getVariableVersions(variable),
    }),
};
