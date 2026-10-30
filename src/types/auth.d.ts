export interface SignInProvider {
  id: string;
  issuer: string;
  client_id: string;
  scopes: string[];
}

export interface AuthConfig {
  authentication_enabled: boolean;
  providers: SignInProvider[];
}

export interface AuthPrincipal {
  provider: string;
  subject: string;
  name?: string;
  email?: string;
  roles: string[] | null;
  permissions: Record<string, boolean>;
}

export interface CurrentUser {
  principal: AuthPrincipal;
}
