import { ErrorResponse } from "oidc-client-ts";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { getPrincipal } from "@/api/auth";
import { clearSignIn, completeSignIn, takeReturnPath } from "@/auth/oidc";
import { finishSignIn } from "@/auth/session";

vi.mock("@/auth/oidc", () => ({
  clearSignIn: vi.fn(),
  completeSignIn: vi.fn(),
  getProfile: vi.fn(),
  takeReturnPath: vi.fn(),
}));
vi.mock("@/api/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/api/auth")>()),
  getPrincipal: vi.fn(),
}));

const startedFrom = "/playbooks/42?tab=steps#top";

const loginWith = (target: string) => {
  const url = new URL(target, "https://soarca.test");
  expect(url.pathname).toBe("/login");
  return Object.fromEntries(url.searchParams);
};

beforeEach(() => {
  vi.stubGlobal("location", { origin: "https://soarca.test" });
  vi.mocked(takeReturnPath).mockReturnValue(startedFrom);
  vi.mocked(completeSignIn).mockResolvedValue();
  vi.mocked(getPrincipal).mockResolvedValue({
    status: "authenticated",
    principal: { subject: "ada", provider: "entra", permissions: [] },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("sign-in callback", () => {
  test("continues to the page the user started from", async () => {
    await expect(finishSignIn()).resolves.toBe(startedFrom);
    expect(takeReturnPath).toHaveBeenCalledOnce();
  });

  test("continues to the no-access screen when SOARCA gives no role", async () => {
    vi.mocked(getPrincipal).mockResolvedValue({ status: "forbidden" });
    await expect(finishSignIn()).resolves.toBe(startedFrom);
  });

  test("keeps the page when the user cancels at the provider", async () => {
    vi.mocked(completeSignIn).mockRejectedValue(
      new ErrorResponse({ error: "access_denied" }),
    );
    expect(loginWith(await finishSignIn())).toEqual({
      return_to: startedFrom,
      error: "sign_in_denied",
    });
  });

  test("keeps the page when the sign-in fails for another reason", async () => {
    vi.mocked(completeSignIn).mockRejectedValue(new Error("network"));
    expect(loginWith(await finishSignIn())).toEqual({
      return_to: startedFrom,
      error: "sign_in_failed",
    });
  });

  test("forgets the tokens SOARCA rejected, without signing out at the provider", async () => {
    vi.mocked(getPrincipal).mockResolvedValue({ status: "signed-out" });
    expect(loginWith(await finishSignIn())).toEqual({
      return_to: startedFrom,
      error: "sign_in_failed",
    });
    expect(clearSignIn).toHaveBeenCalledOnce();
  });

  test.each([null, "https://evil.example/phish", "/login?return_to=/x"])(
    "goes to / when the saved page is %s",
    async (saved) => {
      vi.mocked(takeReturnPath).mockReturnValue(saved);
      await expect(finishSignIn()).resolves.toBe("/");
      vi.mocked(completeSignIn).mockRejectedValue(new Error("network"));
      expect(loginWith(await finishSignIn()).return_to).toBe("/");
    },
  );
});
