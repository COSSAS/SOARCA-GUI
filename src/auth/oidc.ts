import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import type { SignInProvider } from "@/types";
import { PATHS } from "@/utils";

const providerKey = "soarca.auth.provider";
let current: { stored: string; manager: UserManager } | undefined;

// Every tab reads and writes the sign-in under this lock. The lock is not
// reentrant, so a locked task must not call the functions exported here.
async function withSignInLock<T>(task: () => Promise<T>): Promise<T> {
  return navigator.locks.request("soarca.auth", task);
}

// The stored value may come from an earlier GUI version or another backend.
function parseProvider(stored: string): SignInProvider | undefined {
  try {
    const provider = JSON.parse(stored);
    const valid =
      typeof provider.issuer === "string" &&
      typeof provider.client_id === "string" &&
      Array.isArray(provider.scopes);
    return valid ? provider : undefined;
  } catch {
    return undefined;
  }
}

// Follows the stored provider, which a sign-in in another tab can change.
function userManager() {
  const stored = localStorage.getItem(providerKey);
  if (!stored) return undefined;
  if (current?.stored !== stored) {
    const provider = parseProvider(stored);
    if (!provider) {
      localStorage.removeItem(providerKey);
      return undefined;
    }
    const manager = new UserManager({
      authority: provider.issuer,
      client_id: provider.client_id,
      redirect_uri: location.origin + PATHS.LOGIN_CALLBACK,
      scope: [
        "openid",
        "profile",
        "email",
        "offline_access",
        ...provider.scopes,
      ].join(" "),
      // localStorage instead of the default sessionStorage, so every tab shares the sign-in.
      userStore: new WebStorageStateStore({ store: localStorage }),
      automaticSilentRenew: false,
      requestTimeoutInSeconds: 10,
    });
    current = { stored, manager };
  }
  return current.manager;
}

export async function signIn(provider: SignInProvider, returnTo: string) {
  const manager = await withSignInLock(async () => {
    localStorage.setItem(providerKey, JSON.stringify(provider));
    return userManager();
  });
  if (!manager) throw new Error("SOARCA published an unusable provider");
  await manager.signinRedirect({ state: returnTo, prompt: "select_account" });
}

// Resolves to the path the user was on when they started signing in.
export async function completeSignIn(): Promise<string> {
  const user = await withSignInLock(async () =>
    userManager()?.signinCallback(),
  );
  if (!user) throw new Error("No sign-in in progress");
  return typeof user.state === "string" ? user.state : "/";
}

export function signOut() {
  return withSignInLock(async () => {
    await userManager()?.removeUser();
    localStorage.removeItem(providerKey);
  });
}

// Renews with the refresh token shortly before expiry. Without one the API
// answers 401 and the user signs in again.
export function getAccessToken(): Promise<string | undefined> {
  return withSignInLock(async () => {
    const manager = userManager();
    const user = await manager?.getUser();
    if (!manager || !user) return undefined;
    if ((user.expires_in ?? Infinity) > 30) return user.access_token;
    if (!user.refresh_token) return undefined;
    return (await manager.signinSilent().catch(() => null))?.access_token;
  });
}
