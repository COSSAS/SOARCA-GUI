// Secret, variable and mapping API. SOARCA does not serve these yet; in
// development the Vite mock in src/mock answers them (VITE_MOCK_STORE_API=true).

import type { ISODateString } from "./common";

/** `identity--<uuid>` of the user who made a change. */
export type IdentityRef = string;

export type SecretKind =
  | "password"
  | "token"
  | "url"
  | "ssh-private-key"
  | "generic";

export type SecretOperation =
  | "list"
  | "get"
  | "create"
  | "write_version"
  | "patch"
  | "delete_version"
  | "undelete_version"
  | "destroy_version"
  | "delete";

/** Show or hide secret actions based on `operations`, never on `type`. */
export type SecretBackend = {
  type: string;
  production: boolean;
  versioning: boolean;
  max_versions: number;
  operations: SecretOperation[];
  kinds: SecretKind[];
};

/** The API never returns a secret value. Entries the backend cannot read have kind `invalid`. */
export type SecretMetadata = {
  name: string;
  kind: SecretKind | "invalid";
  description: string;
  version: number;
  oldest_version: number;
  created: ISODateString;
  modified: ISODateString;
};

export type SecretVersion = {
  version: number;
  created: ISODateString;
  current?: boolean;
  deleted?: ISODateString;
  destroyed?: boolean;
};

export type StoredVariable = {
  name: string;
  /** CACAO variable type, fixed after creation. */
  type: string;
  value: string;
  description: string;
  version: number;
  oldest_version: number;
  created: ISODateString;
  created_by: IdentityRef;
  modified: ISODateString;
  modified_by: IdentityRef;
};

export type StoredVariableVersion = {
  version: number;
  value: string;
  created: ISODateString;
  created_by: IdentityRef;
  current?: boolean;
};

export type NewStoredVariable = Pick<
  StoredVariable,
  "name" | "type" | "value" | "description"
>;

/** Where a mapped value comes from. A `version` pins it; without one the current version is used. */
export type MappingSource =
  | { secret: string; version?: number }
  | { variable: string; version?: number };

export type PlaybookMapping = {
  /** Keyed by the playbook variable, for example `__jira_token__`. */
  variables: Record<string, MappingSource>;
  version: number;
  modified: ISODateString;
  modified_by: IdentityRef;
};

export type PlaybookMappingVersion = PlaybookMapping & { current?: boolean };

export type ReferenceStatus =
  | "ok"
  | "missing"
  | "deleted"
  | "destroyed"
  | "invalid"
  | "type_mismatch";

export type ResolvedVariable = {
  ref: string;
  source: MappingSource;
  /** The version a run would use. Absent when the source cannot be read. */
  version?: number;
  status: ReferenceStatus;
};

export type ResolvedField = {
  field: string;
  source: MappingSource;
  version?: number;
  status: ReferenceStatus;
};

/** A stored authentication info or target that the playbook references. */
export type ResolvedObject = {
  ref: string;
  name: string;
  version?: number;
  status: "ok" | "type_mismatch" | "incomplete";
  warnings?: { code: string; field?: string }[];
  fields: ResolvedField[];
};

export type PlaybookResolve = {
  playbook_id: string;
  /** False when any entry is not ok or `unmapped` is not empty. */
  ready: boolean;
  variables: ResolvedVariable[];
  /** Not sent by the mock yet. */
  authentication_info?: ResolvedObject[];
  /** Not sent by the mock yet. */
  targets?: ResolvedObject[];
  /**
   * External playbook variables and empty credential fields that nothing
   * fills. The run form asks for unmapped external variables.
   */
  unmapped: string[];
};
