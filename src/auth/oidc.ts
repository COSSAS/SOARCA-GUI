import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import { loginUrl } from "@/auth/login";
import type { SignInProvider } from "@/types";
import { PATHS } from "@/utils";

const providerKey = "soarca.auth.provider";
// Per tab, so the callback knows where the user started, also when it fails.
const returnToKey = "soarca.auth.return_to";
let current: { stored: string; manager: UserManager } | undefined;

// Every tab reads and writes the sign-in under this lock. The lock is not
// reentrant, so a locked task must not call the functions exported here.
async function withSignInLock<T>(task: () => Promise<T>): Promise<T> {
  return navigator.locks.request("soarca.auth", task);
}

// Runs the task under the lock, or returns the fallback when nobody is signed
// in. Skipping the lock then keeps anonymous mode working over plain HTTP,
// where navigator.locks does not exist.
function ifSignedIn<T>(
  task: (manager: UserManager) => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!localStorage.getItem(providerKey)) return Promise.resolve(fallback);
  return withSignInLock(async () => {
    const manager = userManager();
    return manager ? task(manager) : fallback;
  });
}

// Follows the stored provider, which a sign-in in another tab can change.
function userManager() {
  const stored = localStorage.getItem(providerKey);
  if (!stored) return undefined;
  if (current?.stored !== stored) {
    const provider: SignInProvider = JSON.parse(stored);
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
  sessionStorage.setItem(returnToKey, returnTo);
  const manager = await withSignInLock(async () => {
    localStorage.setItem(providerKey, JSON.stringify(provider));
    return userManager()!;
  });
  await manager.signinRedirect({ prompt: "select_account" });
}

export async function completeSignIn(): Promise<void> {
  const user = await ifSignedIn((manager) => manager.signinCallback(), undefined);
  if (!user) throw new Error("No sign-in in progress");
}

// The path saved by the last signIn in this tab. Reading it removes it.
export function takeReturnPath(): string | null {
  const path = sessionStorage.getItem(returnToKey);
  sessionStorage.removeItem(returnToKey);
  return path;
}

async function forget(manager: UserManager) {
  await manager.removeUser();
  localStorage.removeItem(providerKey);
}

// Forgets the tokens in this browser. The session at the provider stays open.
export function clearSignIn(): Promise<void> {
  return ifSignedIn(forget, undefined);
}

// Forgets the tokens in this browser, then resolves to the page that ends the
// session at the provider and returns to the login page. Without an
// end-session endpoint that is the login page itself. Rejects only when the
// tokens could not be forgotten, so the user is still signed in.
export async function signOut(): Promise<string> {
  const signedOut = await ifSignedIn(async (manager) => {
    const user = await manager.getUser();
    await forget(manager);
    return {
      manager,
      idToken: user?.id_token,
      loginHint: user?.profile.login_hint,
    };
  }, undefined);
  if (!signedOut) return PATHS.LOGIN;
  const { manager, idToken, loginHint } = signedOut;
  let endpoint: string | undefined;
  try {
    endpoint = await manager.metadataService.getEndSessionEndpoint();
  } catch {
    return loginUrl({ error: "provider_sign_out_failed" });
  }
  if (!endpoint) return PATHS.LOGIN;
  const url = new URL(endpoint);
  url.searchParams.set("client_id", manager.settings.client_id);
  url.searchParams.set("post_logout_redirect_uri", location.origin + PATHS.LOGIN);
  if (idToken) url.searchParams.set("id_token_hint", idToken);
  // Entra puts login_hint in the ID token when the app enables that optional
  // claim. Passing it back skips Entra's "pick an account to sign out" screen.
  if (typeof loginHint === "string") {
    url.searchParams.set("logout_hint", loginHint);
  }
  return url.toString();
}

// For display only; SOARCA decides access from the token, not from these claims.
export function getProfile(): Promise<{ name?: string; email?: string }> {
  return ifSignedIn<{ name?: string; email?: string }>(async (manager) => {
    const profile = (await manager.getUser())?.profile;
    return { name: profile?.name, email: profile?.email };
  }, {});
}

// Renews with the refresh token shortly before expiry. Without one the API
// answers 401 and the user signs in again.
export function getAccessToken(): Promise<string | undefined> {
  return ifSignedIn(async (manager) => {
    const user = await manager.getUser();
    if (!user) return undefined;
    if ((user.expires_in ?? Infinity) > 30) return user.access_token;
    if (!user.refresh_token) return undefined;
    return (await manager.signinSilent().catch(() => null))?.access_token;
  }, undefined);
}
