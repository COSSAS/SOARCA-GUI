import type {
  MappingSource,
  PlaybookMapping,
  PlaybookMappingVersion,
  PlaybookResolve,
  ReferenceStatus,
  SecretBackend,
  SecretMetadata,
  SecretVersion,
  StoredVariable,
  StoredVariableVersion,
  Variables,
} from "@/types";

// In-memory stand-in for the secret, variable and mapping routes from the
// SOARCA design doc. The Vite dev server runs it (see vite.config.ts), so it
// uses only plain JavaScript and can be tested without a server.

export const NAME_PATTERN = /^[a-z0-9][a-z0-9_.-]{0,127}$/;
export const MAX_VERSIONS = 10;

export interface MockRequest {
  method: string;
  /** Path without the `/api` prefix, for example `/variable/fw-api-user`. */
  path: string;
  query: URLSearchParams;
  body?: unknown;
  /** Passed to the playbook loader so it can ask SOARCA as the same user. */
  authorization?: string;
}

export interface MockResponse {
  status: number;
  body?: unknown;
}

/** Returns the playbook variables, or null when the playbook does not exist. */
export type PlaybookLoader = (
  id: string,
  authorization?: string,
) => Promise<Variables | null>;

interface StoreOptions {
  loadPlaybookVariables: PlaybookLoader;
  identity?: string;
  now?: () => string;
}

interface SecretEntry {
  meta: SecretMetadata;
  versions: SecretVersion[];
}

interface VariableEntry {
  meta: StoredVariable;
  versions: StoredVariableVersion[];
}

interface MappingEntry {
  current: PlaybookMapping;
  history: PlaybookMapping[];
}

const BACKEND: SecretBackend = {
  type: "openbao",
  production: false,
  versioning: true,
  max_versions: MAX_VERSIONS,
  // Secrets are managed outside SOARCA, so the mock only reads them.
  operations: ["list", "get"],
  kinds: ["password", "token", "url", "ssh-private-key", "generic"],
};

// Secret values arrive as text, so a secret cannot feed these types.
const NON_TEXT_TYPES = new Set(["integer", "long", "bool"]);

const ADMIN = "identity--8a3e0f52-1b7c-4d29-9e61-0c5d2f7a4b10";

const json = (status: number, body?: unknown): MockResponse => ({
  status,
  body,
});

const error = (status: number, path: string, message: string) =>
  json(status, { status, "original-call": `/api${path}`, message });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** True for the paths this mock owns. Everything else belongs to SOARCA. */
export const isStoreRoute = (path: string) =>
  /^\/(secret|variable)(\/|$)/.test(path) ||
  /^\/playbook\/[^/]+\/(mapping|resolve)(\/|$)/.test(path);

export function validateVariableValue(
  type: string,
  value: string,
): string | null {
  switch (type) {
    case "integer":
    case "long":
      return /^-?\d+$/.test(value) ? null : "Value must be a whole number.";
    case "bool":
      return value === "true" || value === "false"
        ? null
        : "Value must be true or false.";
    case "float":
      return value.trim() !== "" && Number.isFinite(Number(value))
        ? null
        : "Value must be a number.";
    case "ipv4-addr": {
      const [ip, prefix, ...extra] = value.split("/");
      const octets = ip.split(".");
      return extra.length === 0 &&
        octets.length === 4 &&
        octets.every((o) => /^\d{1,3}$/.test(o) && Number(o) <= 255) &&
        (prefix === undefined || (/^\d{1,2}$/.test(prefix) && +prefix <= 32))
        ? null
        : "Value must be an IPv4 address.";
    }
    case "ipv6-addr":
      return value.includes(":") && /^[0-9a-fA-F:.]+(\/\d{1,3})?$/.test(value)
        ? null
        : "Value must be an IPv6 address.";
    case "mac-addr":
      return /^([0-9a-fA-F]{2}[:-]){5}[0-9a-fA-F]{2}$/.test(value)
        ? null
        : "Value must be a MAC address.";
    case "uuid":
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value,
      )
        ? null
        : "Value must be a UUID.";
    case "hexstring":
    case "hash":
      return /^[0-9a-fA-F]+$/.test(value)
        ? null
        : "Value must contain only hexadecimal digits.";
    case "md5-hash":
      return /^[0-9a-fA-F]{32}$/.test(value)
        ? null
        : "Value must be 32 hexadecimal digits.";
    case "sha256-hash":
      return /^[0-9a-fA-F]{64}$/.test(value)
        ? null
        : "Value must be 64 hexadecimal digits.";
    case "dictionary":
      try {
        const parsed: unknown = JSON.parse(value);
        return isRecord(parsed) ? null : "Value must be a JSON object.";
      } catch {
        return "Value must be a JSON object.";
      }
    case "uri":
      try {
        new URL(value);
        return null;
      } catch {
        return "Value must be an absolute URI.";
      }
    default:
      return null;
  }
}

function seedSecrets(): SecretEntry[] {
  const secret = (
    name: string,
    kind: SecretMetadata["kind"],
    description: string,
    versions: SecretVersion[],
  ): SecretEntry => {
    const current = versions.find((v) => v.current) ?? versions.at(-1)!;
    return {
      meta: {
        name,
        kind,
        description,
        version: current.version,
        oldest_version: versions[0].version,
        created: versions[0].created,
        modified: current.created,
      },
      versions,
    };
  };
  return [
    secret("fw-api-password", "password", "Perimeter firewall API user", [
      { version: 1, created: "2026-01-12T09:00:00Z", destroyed: true },
      {
        version: 2,
        created: "2026-03-02T14:20:00Z",
        deleted: "2026-05-10T08:00:00Z",
      },
      { version: 3, created: "2026-05-10T08:00:00Z", current: true },
    ]),
    secret("jira-token", "token", "Jira API token for the SOC project", [
      { version: 1, created: "2026-02-01T10:00:00Z" },
      { version: 2, created: "2026-06-01T10:00:00Z", current: true },
    ]),
    secret("jira-base-url", "url", "Jira instance base URL", [
      { version: 1, created: "2026-02-01T10:05:00Z", current: true },
    ]),
    secret("soc-ssh-key", "ssh-private-key", "Jump host key for responders", [
      { version: 1, created: "2026-04-18T16:45:00Z", current: true },
    ]),
    secret("teams-webhook", "generic", "", [
      {
        version: 1,
        created: "2026-04-20T12:00:00Z",
        current: true,
        deleted: "2026-07-01T09:30:00Z",
      },
    ]),
    secret("legacy-kms-key", "invalid", "Written outside SOARCA", [
      { version: 1, created: "2025-11-03T07:00:00Z", current: true },
    ]),
  ];
}

function seedVariables(): VariableEntry[] {
  const variable = (
    name: string,
    type: string,
    values: string[],
    description: string,
    created: string,
  ): VariableEntry => {
    const versions = values.map((value, i) => ({
      version: i + 1,
      value,
      created,
      created_by: ADMIN,
      current: i === values.length - 1 || undefined,
    }));
    return {
      meta: {
        name,
        type,
        value: values.at(-1)!,
        description,
        version: values.length,
        oldest_version: 1,
        created,
        created_by: ADMIN,
        modified: created,
        modified_by: ADMIN,
      },
      versions,
    };
  };
  return [
    variable(
      "fw-api-user",
      "string",
      ["soarca", "soarca-svc"],
      "Firewall API service account",
      "2026-01-12T09:00:00Z",
    ),
    variable(
      "firewall-mgmt-ip",
      "ipv4-addr",
      ["10.20.0.1"],
      "Management address of the perimeter firewall",
      "2026-01-12T09:05:00Z",
    ),
    variable(
      "soc-mail-domain",
      "string",
      ["soc.example.org"],
      "Domain used for SOC notifications",
      "2026-02-14T11:00:00Z",
    ),
    variable(
      "block-max-retries",
      "integer",
      ["5", "3"],
      "How often a block action is retried",
      "2026-02-14T11:10:00Z",
    ),
    variable(
      "auto-block-enabled",
      "bool",
      ["false"],
      "Allow playbooks to block without manual approval",
      "2026-05-22T15:30:00Z",
    ),
    variable(
      "case-management-endpoint",
      "string",
      [
        "https://cases.example.org/api/v1/incidents/security-operations",
        "https://cases.example.org/api/v2/incidents/security-operations",
        "https://cases.example.org/api/v3/incidents/security-operations",
        "https://cases.example.org/api/v4/incidents/security-operations",
        "https://cases.example.org/api/v5/incidents/security-operations",
        "https://cases.example.org/api/v6/incidents/security-operations",
        "https://cases.example.org/api/v7/incidents/security-operations",
        "https://cases.example.org/api/v6/incidents/security-operations",
      ],
      "Case management service endpoint",
      "2026-05-22T15:45:00Z",
    ),
    variable(
      "notification-template",
      "string",
      [
        "A security incident requires investigation by the operations team. Review the associated case for details.",
      ],
      "Default incident notification",
      "2026-05-22T15:50:00Z",
    ),
  ];
}

export function createStoreApi({
  loadPlaybookVariables,
  identity = ADMIN,
  now = () => new Date().toISOString(),
}: StoreOptions) {
  const secrets = new Map(seedSecrets().map((s) => [s.meta.name, s]));
  const variables = new Map(seedVariables().map((v) => [v.meta.name, v]));
  const mappings = new Map<string, MappingEntry>();

  const secretStatus = (
    source: { secret: string; version?: number },
    type: string,
  ): { status: ReferenceStatus; version?: number } => {
    const entry = secrets.get(source.secret);
    if (!entry) return { status: "missing" };
    if (entry.meta.kind === "invalid") return { status: "invalid" };
    const wanted = source.version ?? entry.meta.version;
    const version = entry.versions.find((v) => v.version === wanted);
    if (!version) return { status: "missing" };
    if (version.destroyed) return { status: "destroyed", version: wanted };
    if (version.deleted) return { status: "deleted", version: wanted };
    if (NON_TEXT_TYPES.has(type))
      return { status: "type_mismatch", version: wanted };
    return { status: "ok", version: wanted };
  };

  const variableStatus = (
    source: { variable: string; version?: number },
    type: string,
  ): { status: ReferenceStatus; version?: number } => {
    const entry = variables.get(source.variable);
    if (!entry) return { status: "missing" };
    const wanted = source.version ?? entry.meta.version;
    if (!entry.versions.some((v) => v.version === wanted))
      return { status: "missing" };
    if (entry.meta.type !== type)
      return { status: "type_mismatch", version: wanted };
    return { status: "ok", version: wanted };
  };

  const resolveSource = (source: MappingSource, type: string) =>
    "secret" in source
      ? secretStatus(source, type)
      : variableStatus(source, type);

  const mappingsUsing = (variableName: string) =>
    [...mappings.entries()]
      .filter(([, m]) =>
        Object.values(m.current.variables).some(
          (s) => "variable" in s && s.variable === variableName,
        ),
      )
      .map(([playbookId]) => playbookId);

  const parseSource = (value: unknown): MappingSource | string => {
    if (!isRecord(value)) return "must be an object";
    const keys = Object.keys(value).filter((k) => k !== "version");
    if (keys.length !== 1 || !["secret", "variable"].includes(keys[0]))
      return "needs exactly one of secret or variable";
    const name = value[keys[0]];
    if (typeof name !== "string" || !name) return "needs a name";
    const version = value.version;
    if (
      version !== undefined &&
      (!Number.isInteger(version) || (version as number) < 1)
    )
      return "has a version that is not a positive whole number";
    const pinned = version === undefined ? {} : { version: version as number };
    return keys[0] === "secret"
      ? { secret: name, ...pinned }
      : { variable: name, ...pinned };
  };

  const handleSecrets = (req: MockRequest, parts: string[]) => {
    if (req.method !== "GET")
      return error(
        405,
        req.path,
        "This secret backend is read-only. Manage secrets in OpenBao.",
      );
    if (parts.length === 0) {
      const kind = req.query.get("kind");
      const list = [...secrets.values()]
        .map((s) => s.meta)
        .filter((m) => !kind || m.kind === kind);
      return json(200, list);
    }
    if (parts[0] === "backend" && parts.length === 1) return json(200, BACKEND);
    const entry = secrets.get(parts[0]);
    if (!entry) return error(404, req.path, `Secret '${parts[0]}' not found.`);
    if (parts.length === 1) return json(200, entry.meta);
    if (parts[1] === "versions" && parts.length === 2)
      return json(200, entry.versions);
    return undefined;
  };

  // Mappings that pin a version keep it, beyond the newest MAX_VERSIONS.
  const pinnedVersions = (variableName: string) =>
    new Set(
      [...mappings.values()].flatMap((m) =>
        Object.values(m.current.variables).flatMap((s) =>
          "variable" in s && s.variable === variableName && s.version
            ? [s.version]
            : [],
        ),
      ),
    );

  const writeVariableVersion = (entry: VariableEntry, value: string) => {
    const version = entry.meta.version + 1;
    const created = now();
    const all = [
      ...entry.versions.map((v) => ({ ...v, current: undefined })),
      { version, value, created, created_by: identity, current: true },
    ];
    const pinned = pinnedVersions(entry.meta.name);
    const newest = new Set(all.slice(-MAX_VERSIONS).map((v) => v.version));
    entry.versions = all.filter(
      (v) => newest.has(v.version) || pinned.has(v.version),
    );
    entry.meta = {
      ...entry.meta,
      value,
      version,
      oldest_version: entry.versions[0].version,
      modified: created,
      modified_by: identity,
    };
  };

  const createVariable = (req: MockRequest, body: Record<string, unknown>) => {
    const { name, type, value, description = "" } = body;
    if (typeof name !== "string" || !NAME_PATTERN.test(name))
      return error(
        422,
        req.path,
        "Name must start with a lowercase letter or digit and use only a-z, 0-9, '_', '.' or '-' (at most 128 characters).",
      );
    if (variables.has(name))
      return error(409, req.path, `Variable '${name}' already exists.`);
    if (typeof type !== "string" || !type)
      return error(422, req.path, "Type is required.");
    if (typeof value !== "string")
      return error(422, req.path, "Value must be a string.");
    const invalid = validateVariableValue(type, value);
    if (invalid) return error(422, req.path, invalid);
    const created = now();
    const entry: VariableEntry = {
      meta: {
        name,
        type,
        value,
        description: String(description),
        version: 1,
        oldest_version: 1,
        created,
        created_by: identity,
        modified: created,
        modified_by: identity,
      },
      versions: [
        { version: 1, value, created, created_by: identity, current: true },
      ],
    };
    variables.set(name, entry);
    return json(201, entry.meta);
  };

  const handleVariables = (req: MockRequest, parts: string[]) => {
    const body = isRecord(req.body) ? req.body : {};
    if (parts.length === 0) {
      if (req.method === "GET")
        return json(
          200,
          [...variables.values()].map((v) => v.meta),
        );
      if (req.method === "POST") return createVariable(req, body);
      return undefined;
    }

    const entry = variables.get(parts[0]);
    if (!entry)
      return error(404, req.path, `Variable '${parts[0]}' not found.`);

    if (parts.length === 2 && parts[1] === "versions" && req.method === "GET")
      return json(200, entry.versions);
    if (parts.length !== 1) return undefined;

    switch (req.method) {
      case "GET": {
        const asked = req.query.get("version");
        if (!asked) return json(200, entry.meta);
        const old = entry.versions.find((v) => v.version === Number(asked));
        if (!old)
          return error(404, req.path, `Version ${asked} is not retained.`);
        return json(200, {
          ...entry.meta,
          value: old.value,
          version: old.version,
        });
      }
      case "PUT": {
        if ("type" in body && body.type !== entry.meta.type)
          return error(422, req.path, "The type of a variable cannot change.");
        if (body.version !== entry.meta.version)
          return error(
            409,
            req.path,
            `Someone else changed '${entry.meta.name}'. The current version is ${entry.meta.version}.`,
          );
        if (typeof body.value !== "string")
          return error(422, req.path, "Value must be a string.");
        const invalid = validateVariableValue(entry.meta.type, body.value);
        if (invalid) return error(422, req.path, invalid);
        writeVariableVersion(entry, body.value);
        return json(200, entry.meta);
      }
      case "PATCH": {
        if (typeof body.description !== "string")
          return error(422, req.path, "Description must be a string.");
        // Editing the description does not create a version.
        entry.meta = {
          ...entry.meta,
          description: body.description,
          modified: now(),
          modified_by: identity,
        };
        return json(200, entry.meta);
      }
      case "DELETE": {
        const users = mappingsUsing(entry.meta.name);
        if (users.length)
          return error(
            409,
            req.path,
            `'${entry.meta.name}' is still mapped in: ${users.join(", ")}. Remove those mappings first.`,
          );
        variables.delete(entry.meta.name);
        return json(204);
      }
    }
    return undefined;
  };

  const putMapping = async (req: MockRequest, playbookId: string) => {
    const body = isRecord(req.body) ? req.body : {};
    if (!isRecord(body.variables))
      return error(422, req.path, "variables must be an object.");
    const playbookVariables = await loadPlaybookVariables(
      playbookId,
      req.authorization,
    );
    if (!playbookVariables)
      return error(404, req.path, `Playbook '${playbookId}' not found.`);
    // Checked after the playbook loads, so a write made meanwhile is not lost.
    const entry = mappings.get(playbookId);
    const expected = entry?.current.version ?? 0;
    if ((body.version ?? 0) !== expected)
      return error(
        409,
        req.path,
        `Someone else changed this mapping. The current version is ${expected}.`,
      );

    const parsed: Record<string, MappingSource> = {};
    for (const [ref, raw] of Object.entries(body.variables)) {
      if (playbookVariables[ref]?.external !== true)
        return error(
          422,
          req.path,
          `${ref} is not an external variable of this playbook.`,
        );
      const source = parseSource(raw);
      if (typeof source === "string")
        return error(422, req.path, `The source for ${ref} ${source}.`);
      parsed[ref] = source;
    }

    const next: PlaybookMapping = {
      variables: parsed,
      version: expected + 1,
      modified: now(),
      modified_by: identity,
    };
    mappings.set(playbookId, {
      current: next,
      history: entry
        ? [...entry.history, entry.current].slice(-(MAX_VERSIONS - 1))
        : [],
    });
    return json(200, next);
  };

  const handleMapping = async (
    req: MockRequest,
    playbookId: string,
    rest: string[],
  ): Promise<MockResponse | undefined> => {
    const entry = mappings.get(playbookId);
    if (rest.length === 1 && rest[0] === "versions" && req.method === "GET") {
      if (!entry) return json(200, []);
      const history: PlaybookMappingVersion[] = [
        ...entry.history,
        { ...entry.current, current: true },
      ];
      return json(200, history);
    }
    if (rest.length !== 0) return undefined;

    switch (req.method) {
      case "GET":
        return entry
          ? json(200, entry.current)
          : error(404, req.path, "This playbook has no mapping yet.");
      case "DELETE":
        if (!entry)
          return error(404, req.path, "This playbook has no mapping yet.");
        mappings.delete(playbookId);
        return json(204);
      case "PUT":
        return putMapping(req, playbookId);
    }
    return undefined;
  };

  const handleResolve = async (
    req: MockRequest,
    playbookId: string,
  ): Promise<MockResponse> => {
    const playbookVariables = await loadPlaybookVariables(
      playbookId,
      req.authorization,
    );
    if (!playbookVariables)
      return error(404, req.path, `Playbook '${playbookId}' not found.`);
    const mapped = mappings.get(playbookId)?.current.variables ?? {};
    const resolved = Object.entries(mapped).map(([ref, source]) => {
      const variable = playbookVariables[ref];
      const result =
        variable?.external === true
          ? resolveSource(source, variable.type)
          : { status: "missing" as const };
      return { ref, source, ...result };
    });
    const unmapped = Object.entries(playbookVariables)
      .filter(([ref, v]) => v.external === true && !(ref in mapped))
      .map(([ref]) => ref);
    const result: PlaybookResolve = {
      playbook_id: playbookId,
      ready: resolved.every((v) => v.status === "ok") && unmapped.length === 0,
      variables: resolved,
      unmapped,
    };
    return json(200, result);
  };

  /** Answers a store route, or returns undefined so the request goes on to SOARCA. */
  async function handle(req: MockRequest): Promise<MockResponse | undefined> {
    if (!isStoreRoute(req.path)) return undefined;
    const parts = req.path.split("/").filter(Boolean).map(decodeURIComponent);
    const [group, ...rest] = parts;
    if (group === "secret") return handleSecrets(req, rest);
    if (group === "variable") return handleVariables(req, rest);
    if (group === "playbook" && rest.length >= 2) {
      const [playbookId, route, ...tail] = rest;
      if (route === "mapping") return handleMapping(req, playbookId, tail);
      if (route === "resolve" && tail.length === 0 && req.method === "GET")
        return handleResolve(req, playbookId);
    }
    return undefined;
  }

  /** Deleting a playbook deletes its mapping. */
  const forgetPlaybook = (playbookId: string) => mappings.delete(playbookId);

  return { handle, forgetPlaybook };
}
