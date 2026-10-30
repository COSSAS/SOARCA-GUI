import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { getCurrentUser, safeReturnPath } from "@/api/auth";
import { getPlaybooks } from "@/api/playbooks";
import { ApiError, shouldRetryApiRequest } from "@/api/utils";
import { getAccessToken, signOut } from "@/auth/oidc";
import { hasPermission, Permissions } from "@/auth/permissions";
import type { AuthPrincipal } from "@/types";

const location = {
  origin: "https://soarca.test",
  pathname: "/playbooks/42",
  search: "?tab=steps",
  hash: "#top",
  assign: vi.fn(),
};

const respond = (status: number, body?: unknown) =>
  vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
    }),
  );

const storage = new Map<string, string>();
const localStorage = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  key: (index: number) => [...storage.keys()][index] ?? null,
  get length() {
    return storage.size;
  },
};

// One lock queue shared by every simulated tab, like the browser's.
let lockQueue = Promise.resolve();
const locks = {
  request: async <T>(_name: string, task: () => Promise<T>) => {
    const previous = lockQueue;
    let release!: () => void;
    lockQueue = new Promise((resolve) => (release = resolve));
    await previous;
    try {
      return await task();
    } finally {
      release();
    }
  },
};

beforeEach(() => {
  lockQueue = Promise.resolve();
  vi.stubGlobal("location", location);
  vi.stubGlobal("window", { location });
  vi.stubGlobal("localStorage", localStorage);
  vi.stubGlobal("navigator", { locks });
});

afterEach(() => {
  vi.unstubAllGlobals();
  location.assign.mockReset();
  storage.clear();
});

describe("signing in", () => {
  test("keeps the user on the page they asked for", () => {
    expect(safeReturnPath("/monitoring/abc?view=timeline#step-3")).toBe(
      "/monitoring/abc?view=timeline#step-3",
    );
    expect(safeReturnPath(null)).toBe("/");
  });

  test.each([
    "https://evil.example/phish",
    "//evil.example/phish",
    "/\\evil.example/phish",
    "javascript:alert(1)",
    "/api/auth/me",
    "/login?return_to=/login",
    "/login/callback?code=abc",
  ])("never returns to %s after sign-in", (value) => {
    expect(safeReturnPath(value)).toBe("/");
  });
});

describe("session check", () => {
  test("treats 401 from /me as signed out without redirecting", async () => {
    vi.stubGlobal("fetch", respond(401, { message: "unauthorized" }));
    await expect(getCurrentUser()).resolves.toBeNull();
    expect(location.assign).not.toHaveBeenCalled();
  });

  test("surfaces a server failure instead of treating it as signed out", async () => {
    vi.stubGlobal("fetch", respond(503));
    await expect(getCurrentUser()).rejects.toMatchObject({ status: 503 });
  });
});

describe("expired session", () => {
  test("sends the user to login and back to the current page", async () => {
    vi.stubGlobal("fetch", respond(401, { message: "session expired" }));

    await expect(getPlaybooks()).rejects.toMatchObject({ status: 401 });

    const target = new URL(location.assign.mock.calls[0][0], location.origin);
    expect(target.pathname).toBe("/login");
    expect(target.searchParams.get("reason")).toBe("expired");
    expect(target.searchParams.get("return_to")).toBe(
      "/playbooks/42?tab=steps#top",
    );
  });

  test("does not retry unauthorised or forbidden requests", () => {
    const error = (status: number) =>
      new ApiError(status, { status, message: "", "original-call": "" });
    expect(shouldRetryApiRequest(0, error(401))).toBe(false);
    expect(shouldRetryApiRequest(0, error(403))).toBe(false);
    expect(shouldRetryApiRequest(0, error(503))).toBe(true);
    expect(shouldRetryApiRequest(3, error(503))).toBe(false);
  });
});

describe("forbidden request", () => {
  test("shows a generic message and keeps the user on the page", async () => {
    vi.stubGlobal(
      "fetch",
      respond(403, { message: "role soarca:admin missing" }),
    );

    await expect(getPlaybooks()).rejects.toMatchObject({
      status: 403,
      message: "You do not have access to this resource.",
    });
    expect(location.assign).not.toHaveBeenCalled();
  });
});

const provider = {
  id: "entra",
  issuer: "https://login.test/tenant/v2.0",
  client_id: "gui",
  scopes: ["api://soarca/user_impersonation"],
};
const userKey = `oidc.user:${provider.issuer}:${provider.client_id}`;

const signInWith = (user: object) => {
  storage.set("soarca.auth.provider", JSON.stringify(provider));
  storage.set(
    userKey,
    JSON.stringify({ token_type: "Bearer", profile: {}, ...user }),
  );
};

describe("signed-in requests", () => {
  const authorization = async () => {
    const fetch = respond(200, []);
    vi.stubGlobal("fetch", fetch);
    await getPlaybooks();
    const init: RequestInit = fetch.mock.calls[0][1];
    return new Headers(init.headers).get("Authorization");
  };

  beforeEach(() =>
    signInWith({
      access_token: "token-123",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }),
  );

  test("carry the access token", async () => {
    expect(await authorization()).toBe("Bearer token-123");
  });

  test("stop carrying it after sign-out", async () => {
    await signOut();
    expect(await authorization()).toBeNull();
    expect(storage.size).toBe(0);
  });

  test("ignore a provider stored in an unusable format", async () => {
    storage.set(
      "soarca.auth.provider",
      JSON.stringify({ id: "entra", label: "Sign in with Microsoft" }),
    );
    expect(await authorization()).toBeNull();
    expect(storage.has("soarca.auth.provider")).toBe(false);
  });
});

describe("token refresh", () => {
  let tokenRequests: number;
  let answerTokenRequest: () => void;

  beforeEach(() => {
    tokenRequests = 0;
    signInWith({
      access_token: "token-1",
      refresh_token: "refresh-1",
      expires_at: Math.floor(Date.now() / 1000) + 10,
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/.well-known/openid-configuration")) {
          return Response.json({
            issuer: provider.issuer,
            token_endpoint: `${provider.issuer}/token`,
          });
        }
        tokenRequests++;
        await new Promise<void>((resolve) => (answerTokenRequest = resolve));
        return Response.json({
          access_token: "token-2",
          refresh_token: "refresh-2",
          token_type: "Bearer",
          expires_in: 3600,
        });
      }),
    );
  });

  test("tabs share one refresh", async () => {
    vi.resetModules();
    const firstTab = await import("@/auth/oidc");
    vi.resetModules();
    const secondTab = await import("@/auth/oidc");

    const tokens = Promise.all([
      firstTab.getAccessToken(),
      secondTab.getAccessToken(),
    ]);
    await vi.waitFor(() => expect(tokenRequests).toBe(1));
    answerTokenRequest();

    expect(await tokens).toEqual(["token-2", "token-2"]);
    expect(tokenRequests).toBe(1);
    expect(JSON.parse(storage.get(userKey)!).refresh_token).toBe("refresh-2");
  });

  test("signing out during a refresh leaves no tokens behind", async () => {
    const token = getAccessToken();
    await vi.waitFor(() => expect(tokenRequests).toBe(1));
    const signedOut = signOut();
    answerTokenRequest();

    await Promise.all([token, signedOut]);
    expect(storage.size).toBe(0);
  });
});

describe("permissions", () => {
  const principal = (permissions: Record<string, boolean>): AuthPrincipal => ({
    provider: "entra",
    subject: "user",
    roles: null,
    permissions,
  });

  test("grants only what the user has", () => {
    const reader = principal({ [Permissions.PlaybookRead]: true });
    expect(hasPermission(reader, Permissions.PlaybookRead)).toBe(true);
    expect(hasPermission(reader, Permissions.PlaybookWrite)).toBe(false);
    expect(
      hasPermission(
        principal({ [Permissions.PlaybookExecute]: false }),
        Permissions.PlaybookExecute,
      ),
    ).toBe(false);
    expect(hasPermission(undefined, Permissions.PlaybookRead)).toBe(false);
  });

  test("admins can do everything", () => {
    const admin = principal({ [Permissions.Admin]: true });
    for (const permission of Object.values(Permissions)) {
      expect(hasPermission(admin, permission)).toBe(true);
    }
  });
});
