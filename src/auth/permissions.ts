import type { AuthPrincipal } from "@/types";

export const Permissions = {
  PlaybookRead: "playbook:read",
  PlaybookWrite: "playbook:write",
  PlaybookExecute: "playbook:execute",
  Admin: "soarca:admin",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export function hasPermission(
  principal: AuthPrincipal | undefined,
  permission: Permission,
) {
  return (
    principal?.permissions[Permissions.Admin] === true ||
    principal?.permissions[permission] === true
  );
}
