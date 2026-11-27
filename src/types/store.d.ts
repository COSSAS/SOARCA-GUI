// Secret and variable API. SOARCA does not serve these yet; in
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
