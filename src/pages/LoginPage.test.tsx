// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { ThemeProvider } from "styled-components";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthContext, type AuthState } from "@/auth/AuthContext";
import { loadAuthConfig } from "@/auth/config";
import { signInErrorMessage } from "@/auth/login";
import { signIn } from "@/auth/oidc";
import { finishSignIn } from "@/auth/session";
import { LoginPage } from "@/pages/LoginPage";
import { theme } from "@/theme";
import { ThemeModeCtx } from "@/theme/ThemeModeContext";
import type { SignInProvider } from "@/types";
import { PATHS } from "@/utils";

vi.mock("@/auth/config", () => ({ loadAuthConfig: vi.fn() }));
vi.mock("@/auth/session", () => ({ finishSignIn: vi.fn() }));
vi.mock("@/auth/oidc", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/auth/oidc")>()),
  signIn: vi.fn(),
}));

const entra: SignInProvider = {
  id: "entra",
  label: "Microsoft Entra",
  issuer: "https://login.example/v2.0",
  client_id: "gui",
  scopes: [],
  icon: "microsoft",
};
const authentik: SignInProvider = { ...entra, id: "ak", label: "Authentik" };
const prompt = "Choose a login provider";

function CurrentPage() {
  const { pathname, search } = useLocation();
  return <p>Landed on {pathname + search}</p>;
}

function renderLogin(path: string, auth: Partial<AuthState> = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
    logger: { log: () => {}, warn: () => {}, error: () => {} },
  });
  const authState: AuthState = {
    user: null,
    noAccess: false,
    isLoading: false,
    isError: false,
    can: () => false,
    logout: vi.fn(),
    retry: vi.fn(),
    ...auth,
  };
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeModeCtx.Provider
        value={{ mode: "light", resolved: "light", setMode: () => {} }}
      >
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={authState}>
            <MemoryRouter initialEntries={[path]}>
              <Routes>
                <Route path={PATHS.LOGIN} element={<LoginPage />} />
                <Route path={PATHS.LOGIN_CALLBACK} element={<LoginPage />} />
                <Route path="*" element={<CurrentPage />} />
              </Routes>
            </MemoryRouter>
          </AuthContext.Provider>
        </ThemeProvider>
      </ThemeModeCtx.Provider>
    </QueryClientProvider>,
  );
}

const providerButtons = () => screen.getAllByRole("button");

beforeEach(() => {
  vi.mocked(loadAuthConfig).mockResolvedValue([entra, authentik]);
  vi.mocked(signIn).mockReturnValue(new Promise(() => {}));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LoginPage providers", () => {
  it("lists the providers under the prompt", async () => {
    renderLogin(PATHS.LOGIN);
    expect(await screen.findByText(prompt)).toBeTruthy();
    expect(
      providerButtons().map((button) => button.textContent),
    ).toEqual(["Microsoft Entra", "Authentik"]);
  });

  it("shows a spinner and no prompt while the providers load", () => {
    vi.mocked(loadAuthConfig).mockReturnValue(new Promise(() => {}));
    renderLogin(PATHS.LOGIN);
    expect(screen.getByLabelText("Loading login providers")).toBeTruthy();
    expect(screen.queryByText(prompt)).toBeNull();
  });

  it("starts one sign-in and keeps the other clicks out", async () => {
    renderLogin(`${PATHS.LOGIN}?return_to=%2Fplaybooks%2F1`);
    await screen.findByText(prompt);
    const [entraButton, authentikButton] = providerButtons();

    fireEvent.click(entraButton);
    fireEvent.click(entraButton);
    fireEvent.click(authentikButton);

    expect(signIn).toHaveBeenCalledTimes(1);
    expect(signIn).toHaveBeenCalledWith(entra, "/playbooks/1");
    for (const button of providerButtons()) {
      expect(button.getAttribute("aria-disabled")).toBe("true");
    }
    expect(screen.getByRole("status").textContent).toBe(
      "Redirecting to sign in",
    );
  });

  it("enables the buttons again when the user comes back with the back button", async () => {
    renderLogin(PATHS.LOGIN);
    await screen.findByText(prompt);
    fireEvent.click(providerButtons()[0]);

    act(() => void window.dispatchEvent(new Event("pageshow")));

    for (const button of providerButtons()) {
      expect(button.getAttribute("aria-disabled")).toBe("false");
    }
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("shows an error and keeps the return path when the provider is unreachable", async () => {
    vi.mocked(signIn).mockRejectedValue(new Error("offline"));
    renderLogin(`${PATHS.LOGIN}?return_to=%2Fplaybooks%2F1`);
    await screen.findByText(prompt);

    fireEvent.click(providerButtons()[0]);

    expect(
      await screen.findByText(signInErrorMessage("provider_unavailable")),
    ).toBeTruthy();
    expect(providerButtons()[0].getAttribute("aria-disabled")).toBe("false");
    fireEvent.click(providerButtons()[0]);
    expect(signIn).toHaveBeenLastCalledWith(entra, "/playbooks/1");
  });

  it("shows the error and session ended notices above the providers", async () => {
    renderLogin(`${PATHS.LOGIN}?error=sign_in_denied&reason=expired`);
    await screen.findByText(prompt);
    expect(screen.getByRole("alert").textContent).toBe(
      signInErrorMessage("sign_in_denied"),
    );
    expect(screen.getByText(/Your session has ended/)).toBeTruthy();
  });

  it("explains a broken config without the prompt", async () => {
    vi.mocked(loadAuthConfig).mockRejectedValue(
      new Error("providers[0].icon must be one of: microsoft"),
    );
    renderLogin(`${PATHS.LOGIN}?error=sign_in_failed`);
    expect(
      await screen.findByText(/providers\[0\]\.icon must be one of/),
    ).toBeTruthy();
    expect(screen.getAllByRole("alert")).toHaveLength(2);
    expect(screen.queryByText(prompt)).toBeNull();
  });
});

describe("LoginPage session states", () => {
  it("sends a signed-in user to the return path", () => {
    renderLogin(`${PATHS.LOGIN}?return_to=%2Fplaybooks%3Ftab%3D2`, {
      user: {} as AuthState["user"],
    });
    expect(screen.getByText("Landed on /playbooks?tab=2")).toBeTruthy();
  });

  it("shows the session check without the prompt", () => {
    renderLogin(PATHS.LOGIN, { isLoading: true });
    expect(screen.getByLabelText("Checking your session")).toBeTruthy();
    expect(screen.queryByText(prompt)).toBeNull();
    expect(loadAuthConfig).not.toHaveBeenCalled();
  });

  it("shows the no access card without the prompt", () => {
    renderLogin(PATHS.LOGIN, { noAccess: true });
    expect(screen.getByText("No access to SOARCA")).toBeTruthy();
    expect(screen.queryByText(prompt)).toBeNull();
  });
});

describe("LoginPage callback", () => {
  it("shows only the spinner while the sign-in finishes", () => {
    vi.mocked(finishSignIn).mockReturnValue(new Promise(() => {}));
    renderLogin(PATHS.LOGIN_CALLBACK, { isLoading: true });
    expect(screen.getByLabelText("Signing in")).toBeTruthy();
    expect(screen.queryByText(prompt)).toBeNull();
    expect(loadAuthConfig).not.toHaveBeenCalled();
  });

  it("goes where finishSignIn says", async () => {
    vi.mocked(finishSignIn).mockResolvedValue(
      "/login?return_to=%2Fplaybooks&error=sign_in_denied",
    );
    renderLogin(PATHS.LOGIN_CALLBACK);
    expect(await screen.findByText(prompt)).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toBe(
      signInErrorMessage("sign_in_denied"),
    );
    expect(finishSignIn).toHaveBeenCalledTimes(1);
  });
});
