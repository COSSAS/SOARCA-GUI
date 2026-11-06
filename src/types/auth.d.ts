import type { ProviderIcon } from "@/auth/login";

// A public client registered for the GUI at an identity provider, read from
// the GUI's auth-config.json.
export interface SignInProvider {
  id: string;
  label: string;
  issuer: string;
  client_id: string;
  scopes: string[];
  icon: ProviderIcon;
}

// GET /principal/permissions.
export interface PrincipalPermissions {
  subject: string;
  provider: string;
  permissions: string[];
}

export interface SessionUser extends PrincipalPermissions {
  // SOARCA runs without authentication and accepts every request.
  anonymous: boolean;
  // Display only, from the identity provider's profile. Never used for access.
  name?: string;
  email?: string;
}
