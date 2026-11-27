import { describe, expect, it } from "vitest";

import type { SecretMetadata, StoredVariable } from "@/types";

import {
  createStoreApi,
  isStoreRoute,
  MAX_VERSIONS,
  validateVariableValue,
} from "./storeApi";

const setup = () => {
  const { handle } = createStoreApi({
    now: () => "2026-08-01T00:00:00Z",
  });
  return async (method: string, path: string, body?: unknown) => {
    const response = await handle({
      method,
      path,
      query: new URLSearchParams(),
      body,
    });
    if (!response) throw new Error(`No route for ${method} ${path}`);
    return response;
  };
};

describe("isStoreRoute", () => {
  it("only claims secret and variable routes", () => {
    expect(isStoreRoute("/secret/")).toBe(true);
    expect(isStoreRoute("/variable/fw-api-user/versions")).toBe(true);
    expect(isStoreRoute("/playbook/abc/mapping")).toBe(false);
    expect(isStoreRoute("/playbook/abc/resolve")).toBe(false);
    expect(isStoreRoute("/playbook/")).toBe(false);
    expect(isStoreRoute("/playbook/abc")).toBe(false);
    expect(isStoreRoute("/trigger/playbook/abc")).toBe(false);
    expect(isStoreRoute("/secrets")).toBe(false);
  });
});

describe("secrets", () => {
  it("are read-only", async () => {
    const response = await setup()("POST", "/secret/", { name: "x" });
    expect(response.status).toBe(405);
  });

  it("returns metadata without secret values", async () => {
    const response = await setup()("GET", "/secret/");
    expect(response.status).toBe(200);
    const secrets = response.body as SecretMetadata[];
    expect(secrets.length).toBeGreaterThan(0);
    for (const secret of secrets) {
      expect(secret).toHaveProperty("name");
      expect(secret).not.toHaveProperty("value");
    }
  });
});

describe("variables", () => {
  it("creates and deletes a variable", async () => {
    const call = setup();
    const created = await call("POST", "/variable/", {
      name: "test-endpoint",
      type: "string",
      value: "https://example.org",
      description: "Test endpoint",
    });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({
      name: "test-endpoint",
      value: "https://example.org",
      version: 1,
    });
    expect((await call("DELETE", "/variable/test-endpoint")).status).toBe(204);
    expect((await call("GET", "/variable/test-endpoint")).status).toBe(404);
  });

  it("rejects a write based on a stale version", async () => {
    const response = await setup()("PUT", "/variable/fw-api-user", {
      version: 1,
      value: "someone",
    });
    expect(response.status).toBe(409);
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

  it("rejects values that do not match the type", () => {
    expect(validateVariableValue("ipv4-addr", "10.0.0.1/24")).toBeNull();
    expect(validateVariableValue("ipv4-addr", "999.1.1.1")).not.toBeNull();
    expect(validateVariableValue("uuid", "not-a-uuid")).not.toBeNull();
    expect(validateVariableValue("md5-hash", "abc")).not.toBeNull();
    expect(validateVariableValue("dictionary", "[]")).not.toBeNull();
    expect(validateVariableValue("dictionary", '{"a":"b"}')).toBeNull();
  });

  it("does not create a version when only the description changes", async () => {
    const response = await setup()("PATCH", "/variable/fw-api-user", {
      description: "New text",
    });
    expect((response.body as StoredVariable).version).toBe(2);
  });
});
