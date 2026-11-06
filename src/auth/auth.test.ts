import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { safeReturnPath } from "@/api/auth";
import { getPlaybooks } from "@/api/playbooks";
import { ApiError, shouldRetryApiRequest } from "@/api/utils";
import {
  clearSignIn,
  getAccessToken,
  getProfile,
  signOut,
} from "@/auth/oidc";
import { loadSession } from "@/auth/session";

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
  test("returns who is signed in, what they may do and their profile", async () => {
    signInWith({
      access_token: "token-123",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      profile: { name: "Ada Lovelace", email: "ada@example.test" },
    });
    const principal = {
      subject: "user",
      provider: "entra",
      permissions: ["playbook:read"],
    };
    vi.stubGlobal("fetch", respond(200, principal));
    await expect(loadSession()).resolves.toEqual({
      user: {
        ...principal,
        anonymous: false,
        name: "Ada Lovelace",
        email: "ada@example.test",
      },
      noAccess: false,
    });
  });

  test("lets everyone in as anonymous when SOARCA has authentication disabled", async () => {
    const principal = {
      subject: "anonymous",
      provider: "anonymous",
      permissions: ["status:read", "playbook:read"],
    };
    const fetch = respond(200, principal);
    vi.stubGlobal("fetch", fetch);
    await expect(loadSession()).resolves.toEqual({
      user: { ...principal, anonymous: true },
      noAccess: false,
    });
    const init: RequestInit = fetch.mock.calls[0][1];
    expect(new Headers(init.headers).get("Authorization")).toBeNull();
  });

  test("works over plain HTTP, where the browser has no navigator.locks", async () => {
    vi.stubGlobal("location", { ...location, origin: "http://10.0.0.5:8081" });
    vi.stubGlobal("navigator", {});
    const principal = {
      subject: "anonymous",
      provider: "anonymous",
      permissions: ["playbook:read"],
    };
    vi.stubGlobal("fetch", respond(200, principal));
    await expect(loadSession()).resolves.toMatchObject({
      user: { anonymous: true },
    });

    vi.stubGlobal("fetch", respond(200, []));
    await expect(getPlaybooks()).resolves.toEqual([]);
    await expect(getProfile()).resolves.toEqual({});
    await expect(clearSignIn()).resolves.toBeUndefined();
    await expect(signOut()).resolves.toBe("/login");
  });

  test("treats 401 as signed out without redirecting", async () => {
    vi.stubGlobal("fetch", respond(401, { message: "unauthorized" }));
    await expect(loadSession()).resolves.toEqual({
      user: null,
      noAccess: false,
    });
    expect(location.assign).not.toHaveBeenCalled();
  });

  test("treats 403 as signed in without a SOARCA role", async () => {
    vi.stubGlobal("fetch", respond(403, { message: "forbidden" }));
    await expect(loadSession()).resolves.toEqual({
      user: null,
      noAccess: true,
    });
    expect(location.assign).not.toHaveBeenCalled();
  });

  test("surfaces a server failure instead of treating it as signed out", async () => {
    vi.stubGlobal("fetch", respond(503));
    await expect(loadSession()).rejects.toMatchObject({ status: 503 });
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
    vi.stubGlobal("fetch", serveDiscovery({}));
    await freshSignOut();
    expect(await authorization()).toBeNull();
    expect(storage.size).toBe(0);
  });
});

const serveDiscovery = (metadata: object) =>
  vi.fn(async () => Response.json({ issuer: provider.issuer, ...metadata }));

// signOut through a new module instance, so the discovery document it loads
// is not cached for later tests.
const freshSignOut = async () => {
  vi.resetModules();
  return (await import("@/auth/oidc")).signOut();
};

describe("sign-out", () => {
  const endSession = `${provider.issuer}/logout`;

  beforeEach(() =>
    signInWith({
      access_token: "token-123",
      id_token: "id-token-123",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }),
  );

  test("ends the session at the provider and returns to login", async () => {
    vi.stubGlobal(
      "fetch",
      serveDiscovery({ end_session_endpoint: endSession }),
    );

    const target = new URL(await freshSignOut());

    expect(target.origin + target.pathname).toBe(endSession);
    expect(Object.fromEntries(target.searchParams)).toEqual({
      client_id: provider.client_id,
      id_token_hint: "id-token-123",
      post_logout_redirect_uri: "https://soarca.test/login",
    });
    expect(storage.size).toBe(0);
  });

  test("passes Entra's login_hint claim back as logout_hint", async () => {
    signInWith({
      access_token: "token-123",
      id_token: "id-token-123",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      profile: { login_hint: "hint-abc" },
    });
    vi.stubGlobal(
      "fetch",
      serveDiscovery({ end_session_endpoint: endSession }),
    );

    const target = new URL(await freshSignOut());

    expect(target.searchParams.get("logout_hint")).toBe("hint-abc");
  });

  test("goes straight to login when the provider has no end-session endpoint", async () => {
    vi.stubGlobal("fetch", serveDiscovery({}));
    await expect(freshSignOut()).resolves.toBe("/login");
    expect(storage.size).toBe(0);
  });

  test("goes straight to login when nobody is signed in", async () => {
    storage.clear();
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(freshSignOut()).resolves.toBe("/login");
    expect(fetch).not.toHaveBeenCalled();
  });

  test("still clears the tokens when the provider cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    await expect(freshSignOut()).resolves.toBe(
      "/login?error=provider_sign_out_failed",
    );
    expect(storage.size).toBe(0);
  });

  test("fails, keeping the user signed in, when the tokens cannot be cleared", async () => {
    vi.stubGlobal("navigator", {});
    await expect(freshSignOut()).rejects.toThrow();
    expect(storage.has(userKey)).toBe(true);
  });
});

describe("return path", () => {
  const sessionStore = new Map<string, string>();

  beforeEach(() => {
    const win: Record<string, unknown> = { location, addEventListener: vi.fn() };
    win.self = win;
    vi.stubGlobal("window", win);
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => sessionStore.get(key) ?? null,
      setItem: (key: string, value: string) => sessionStore.set(key, value),
      removeItem: (key: string) => sessionStore.delete(key),
    });
    vi.stubGlobal(
      "fetch",
      serveDiscovery({ authorization_endpoint: `${provider.issuer}/authorize` }),
    );
  });

  afterEach(() => sessionStore.clear());

  test("signIn saves it for this tab, and it can be taken once", async () => {
    vi.resetModules();
    const { signIn, takeReturnPath } = await import("@/auth/oidc");

    // The redirect never resolves in a browser, because the page unloads.
    void signIn({ ...provider, label: "Entra", icon: "microsoft" }, "/x?y#z");
    await vi.waitFor(() => expect(location.assign).toHaveBeenCalled());

    const authorize = new URL(location.assign.mock.calls[0][0]);
    expect(authorize.origin + authorize.pathname).toBe(
      `${provider.issuer}/authorize`,
    );
    expect(takeReturnPath()).toBe("/x?y#z");
    expect(takeReturnPath()).toBeNull();
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
