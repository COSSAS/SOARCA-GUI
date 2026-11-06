import { afterEach, describe, expect, test, vi } from "vitest";

import { loadAuthConfig } from "@/auth/config";

const serve = (status: number, body?: string) =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(body ?? null, { status })),
  );

const entra = {
  id: "entra",
  label: "Microsoft Entra",
  issuer: "https://login.microsoftonline.com/tenant/v2.0",
  client_id: "gui-client",
  scopes: ["api://soarca/access_as_user"],
  icon: "microsoft",
};

afterEach(() => vi.unstubAllGlobals());

describe("auth-config.json", () => {
  test("offers the configured providers", async () => {
    serve(
      200,
      JSON.stringify({
        providers: [
          entra,
          {
            id: "authentik",
            label: "Company login",
            issuer: "https://auth.example/application/o/soarca/",
            client_id: "soarca-gui",
          },
        ],
      }),
    );
    await expect(loadAuthConfig()).resolves.toEqual([
      entra,
      {
        id: "authentik",
        label: "Company login",
        issuer: "https://auth.example/application/o/soarca/",
        client_id: "soarca-gui",
        scopes: [],
        icon: "lock",
      },
    ]);
  });

  test("lets any provider id pick an icon", async () => {
    serve(
      200,
      JSON.stringify({
        providers: [
          { ...entra, id: "azure" },
          { ...entra, id: "company-sso", icon: "authentik" },
        ],
      }),
    );
    const providers = await loadAuthConfig();
    expect(providers.map((provider) => provider.icon)).toEqual([
      "microsoft",
      "authentik",
    ]);
  });

  test("shows the lock when no icon is set, even for id entra", async () => {
    serve(200, JSON.stringify({ providers: [{ ...entra, icon: undefined }] }));
    const [provider] = await loadAuthConfig();
    expect(provider.icon).toBe("lock");
  });

  test("reports a missing file", async () => {
    serve(404);
    await expect(loadAuthConfig()).rejects.toThrow(/not deployed/);
  });

  test.each([
    ["not JSON", "<!doctype html>", /not valid JSON/],
    ["without providers", "{}", /providers must be a non-empty list/],
    [
      "with an empty provider list",
      JSON.stringify({ providers: [] }),
      /providers must be a non-empty list/,
    ],
    [
      "a provider without label",
      JSON.stringify({ providers: [{ ...entra, label: undefined }] }),
      /label is required/,
    ],
    [
      "a provider without client_id",
      JSON.stringify({ providers: [{ ...entra, client_id: "" }] }),
      /client_id is required/,
    ],
    [
      "an issuer that is not a URL",
      JSON.stringify({ providers: [{ ...entra, issuer: "login.test" }] }),
      /issuer must be an http\(s\) URL/,
    ],
    [
      "the same id twice",
      JSON.stringify({ providers: [entra, entra] }),
      /used twice/,
    ],
    [
      "an unknown icon",
      JSON.stringify({ providers: [{ ...entra, icon: "azure" }] }),
      /providers\[0\]\.icon must be one of: microsoft, authentik, lock/,
    ],
  ])("rejects a file %s", async (_case, body, message) => {
    serve(200, body);
    await expect(loadAuthConfig()).rejects.toThrow(message);
  });

  test("reports a server error", async () => {
    serve(500);
    await expect(loadAuthConfig()).rejects.toThrow(/HTTP 500/);
  });
});
