import type {
  MappingSource,
  NewStoredVariable,
  PlaybookMapping,
  PlaybookResolve,
  SecretBackend,
  SecretMetadata,
  SecretVersion,
  StoredVariable,
  StoredVariableVersion,
} from "@/types";
import {
  ApiError,
  deleteToApi,
  fetchFromApi,
  HttpMutationMethod,
  mutationToApi,
} from "./utils";

const segment = (value: string) => encodeURIComponent(value);

export const getSecretBackend = () =>
  fetchFromApi<SecretBackend>(`/api/secret/backend`);

export const getSecrets = () => fetchFromApi<SecretMetadata[]>(`/api/secret/`);

export const getSecretVersions = (secret: string) =>
  fetchFromApi<SecretVersion[]>(`/api/secret/${segment(secret)}/versions`);

export const getVariables = () =>
  fetchFromApi<StoredVariable[]>(`/api/variable/`);

export const getVariableVersions = (variable: string) =>
  fetchFromApi<StoredVariableVersion[]>(
    `/api/variable/${segment(variable)}/versions`,
  );

export const createVariable = (variable: NewStoredVariable) =>
  mutationToApi<StoredVariable>(
    HttpMutationMethod.POST,
    `/api/variable/`,
    variable,
  );

/** Writes a new version. `version` is the one the user saw; a stale one gives 409. */
export const updateVariableValue = (
  variable: string,
  version: number,
  value: string,
) =>
  mutationToApi<StoredVariable>(
    HttpMutationMethod.PUT,
    `/api/variable/${segment(variable)}`,
    { version, value },
  );

export const updateVariableDescription = (
  variable: string,
  description: string,
) =>
  mutationToApi<StoredVariable>(
    HttpMutationMethod.PATCH,
    `/api/variable/${segment(variable)}`,
    { description },
  );

export const deleteVariable = (variable: string) =>
  deleteToApi(`/api/variable/${segment(variable)}`);

/** Resolves to null when the playbook has no mapping yet. */
export const getPlaybookMapping = (playbookId: string) =>
  fetchFromApi<PlaybookMapping>(
    `/api/playbook/${segment(playbookId)}/mapping`,
  ).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  });

/** `version` is the mapping version the user edited, or 0 for a new mapping. */
export const savePlaybookMapping = (
  playbookId: string,
  version: number,
  variables: Record<string, MappingSource>,
) =>
  mutationToApi<PlaybookMapping>(
    HttpMutationMethod.PUT,
    `/api/playbook/${segment(playbookId)}/mapping`,
    { version, variables },
  );

export const deletePlaybookMapping = (playbookId: string) =>
  deleteToApi(`/api/playbook/${segment(playbookId)}/mapping`);

export const resolvePlaybook = (playbookId: string) =>
  fetchFromApi<PlaybookResolve>(`/api/playbook/${segment(playbookId)}/resolve`);
