import { createContext, useContext } from "react";
import type { AuthConfig, CurrentUser } from "@/types";
import type { Permission } from "@/auth/permissions";

export interface AuthState {
  config: AuthConfig | undefined;
  user: CurrentUser | null | undefined;
  isLoading: boolean;
  isError: boolean;
  can: (permission: Permission) => boolean;
  logout: () => void;
  retry: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth requires AuthProvider");
  return auth;
}
