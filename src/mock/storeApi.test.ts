import { describe, expect, it } from "vitest";

import type { PlaybookResolve, StoredVariable, Variables } from "@/types";

import {
  createStoreApi,
  isStoreRoute,
  MAX_VERSIONS,
  validateVariableValue,
} from "./storeApi";

const PLAYBOOK = "playbook--1";
const playbookVariables: Variables = {
  __token__: { type: "string", external: true },
  __user__: { type: "string", external: true },
  __retries__: { type: "integer", external: true },
  __webhook__: { type: "string", external: true },
  __old_password__: { type: "string", external: true },
  __legacy__: { type: "string", external: true },
  __unmapped__: { type: "string", external: true },
  __internal__: { type: "string" },
};

const setup = () => {
  const { handle, forgetPlaybook } = createStoreApi({
    loadPlaybookVariables: async (id) =>
      id === PLAYBOOK ? playbookVariables : null,
    now: () => "2026-08-01T00:00:00Z",
  });
  const call = async (method: string, path: string, body?: unknown) => {
    const res = await handle({
      method,
      path,
      query: new URLSearchParams(),
      body,
    });
    if (!res) throw new Error(`No route for ${method} ${path}`);
    return res;
  };
  return Object.assign(call, { forgetPlaybook });
};

describe("isStoreRoute", () => {
  it("claims only the store routes", () => {
    expect(isStoreRoute("/secret/")).toBe(true);
    expect(isStoreRoute("/variable/fw-api-user/versions")).toBe(true);
    expect(isStoreRoute("/playbook/abc/mapping")).toBe(true);
    expect(isStoreRoute("/playbook/abc/resolve")).toBe(true);
    expect(isStoreRoute("/playbook/")).toBe(false);
    expect(isStoreRoute("/playbook/abc")).toBe(false);
    expect(isStoreRoute("/trigger/playbook/abc")).toBe(false);
    expect(isStoreRoute("/secrets")).toBe(false);
  });
});

describe("secrets", () => {
  it("are read-only", async () => {
    const call = setup();
    const res = await call("POST", "/secret/", { name: "x" });
    expect(res.status).toBe(405);
  });
});

describe("variables", () => {
  it("rejects a write based on a stale version", async () => {
    const call = setup();
    const res = await call("PUT", "/variable/fw-api-user", {
      version: 1,
      value: "someone",
    });
    expect(res.status).toBe(409);
  });

  it("keeps only the last versions", async () => {
    const call = setup();
    for (let version = 1; version <= MAX_VERSIONS + 2; version++)
      await call("PUT", "/variable/soc-mail-domain", {
        version,
        value: `v${version + 1}.example.org`,
      });
    const meta = (await call("GET", "/variable/soc-mail-domain"))
      .body as StoredVariable;
    const versions = (await call("GET", "/variable/soc-mail-domain/versions"))
      .body as unknown[];
    expect(meta.version).toBe(MAX_VERSIONS + 3);
    expect(versions).toHaveLength(MAX_VERSIONS);
    expect(meta.oldest_version).toBe(4);
  });

  it("keeps versions that a mapping pins", async () => {
    const call = setup();
    await call("PUT", `/playbook/${PLAYBOOK}/mapping`, {
      version: 0,
      variables: { __user__: { variable: "soc-mail-domain", version: 1 } },
    });
    for (let version = 1; version <= MAX_VERSIONS + 2; version++)
      await call("PUT", "/variable/soc-mail-domain", {
        version,
        value: `v${version + 1}.example.org`,
      });
    const versions = (await call("GET", "/variable/soc-mail-domain/versions"))
      .body as { version: number }[];
    expect(versions.map((v) => v.version)).toEqual([
      1,
      ...Array.from({ length: MAX_VERSIONS }, (_, i) => i + 4),
    ]);
  });

  it("rejects values that do not match the type", () => {
    expect(validateVariableValue("ipv4-addr", "10.0.0.1/24")).toBeNull();
    expect(validateVariableValue("ipv4-addr", "999.1.1.1")).not.toBeNull();
    expect(validateVariableValue("uuid", "not-a-uuid")).not.toBeNull();
    expect(validateVariableValue("md5-hash", "abc")).not.toBeNull();
    expect(validateVariableValue("dictionary", "[]")).not.toBeNull();
    expect(validateVariableValue("dictionary", '{"a":"b"}')).toBeNull();
  });

  it("does not create a version when only the description changes", async () => {
    const call = setup();
    const res = await call("PATCH", "/variable/fw-api-user", {
      description: "New text",
    });
    expect((res.body as StoredVariable).version).toBe(2);
  });

  it("refuses to delete a variable that a mapping uses", async () => {
    const call = setup();
    await call("PUT", `/playbook/${PLAYBOOK}/mapping`, {
      version: 0,
      variables: { __user__: { variable: "fw-api-user" } },
    });
    const res = await call("DELETE", "/variable/fw-api-user");
    expect(res.status).toBe(409);
    expect((res.body as { message: string }).message).toContain(PLAYBOOK);
  });
});

describe("playbook mapping", () => {
  it("only maps external variables, from a named source", async () => {
    const call = setup();
    const internal = await call("PUT", `/playbook/${PLAYBOOK}/mapping`, {
      version: 0,
      variables: { __internal__: { secret: "jira-token" } },
    });
    const literal = await call("PUT", `/playbook/${PLAYBOOK}/mapping`, {
      version: 0,
      variables: { __token__: { value: "abc" } },
    });
    expect(internal.status).toBe(422);
    expect(literal.status).toBe(422);
  });

  it("rejects a save based on a stale mapping version", async () => {
    const call = setup();
    const mapping = { __token__: { secret: "jira-token" } };
    await call("PUT", `/playbook/${PLAYBOOK}/mapping`, {
      version: 0,
      variables: mapping,
    });
    const res = await call("PUT", `/playbook/${PLAYBOOK}/mapping`, {
      version: 0,
      variables: mapping,
    });
    expect(res.status).toBe(409);
  });

  it("rejects the second of two saves sent at the same time", async () => {
    const call = setup();
    const save = () =>
      call("PUT", `/playbook/${PLAYBOOK}/mapping`, {
        version: 0,
        variables: { __token__: { secret: "jira-token" } },
      });
    const statuses = (await Promise.all([save(), save()])).map((r) => r.status);
    expect(statuses.sort()).toEqual([200, 409]);
  });

  it("forgets the mapping of a deleted playbook", async () => {
    const call = setup();
    await call("PUT", `/playbook/${PLAYBOOK}/mapping`, {
      version: 0,
      variables: { __user__: { variable: "fw-api-user" } },
    });
    call.forgetPlaybook(PLAYBOOK);
    expect((await call("GET", `/playbook/${PLAYBOOK}/mapping`)).status).toBe(
      404,
    );
    expect((await call("DELETE", "/variable/fw-api-user")).status).toBe(204);
  });

  it("is not ready while an external variable is unmapped", async () => {
    const call = setup();
    const resolve = (await call("GET", `/playbook/${PLAYBOOK}/resolve`))
      .body as PlaybookResolve;
    expect(resolve.variables).toEqual([]);
    expect(resolve.ready).toBe(false);
  });

  it("reports the status of every mapped source", async () => {
    const call = setup();
    await call("PUT", `/playbook/${PLAYBOOK}/mapping`, {
      version: 0,
      variables: {
        __token__: { secret: "jira-token" },
        __user__: { variable: "fw-api-user", version: 1 },
        __retries__: { variable: "soc-mail-domain" },
        __webhook__: { secret: "teams-webhook" },
        __old_password__: { secret: "fw-api-password", version: 1 },
        __legacy__: { secret: "legacy-kms-key" },
      },
    });
    const resolve = (await call("GET", `/playbook/${PLAYBOOK}/resolve`))
      .body as PlaybookResolve;
    const status = Object.fromEntries(
      resolve.variables.map((v) => [v.ref, [v.status, v.version]]),
    );
    expect(status).toEqual({
      __token__: ["ok", 2],
      __user__: ["ok", 1],
      __retries__: ["type_mismatch", 1],
      __webhook__: ["deleted", 1],
      __old_password__: ["destroyed", 1],
      __legacy__: ["invalid", undefined],
    });
    expect(resolve.unmapped).toEqual(["__unmapped__"]);
    expect(resolve.ready).toBe(false);
  });
});
