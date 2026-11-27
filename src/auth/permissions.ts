export const Permissions = {
  StatusRead: "status:read",
  PlaybookRead: "playbook:read",
  PlaybookWrite: "playbook:write",
  PlaybookExecute: "playbook:execute",
  SecretRead: "secret:read",
  SecretWrite: "secret:write",
  VariableRead: "variable:read",
  VariableWrite: "variable:write",
  MappingRead: "mapping:read",
  MappingWrite: "mapping:write",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

// SOARCA does not issue the store permissions yet. While the mock store API
// answers those routes, the GUI grants them to every signed-in user.
export const MOCKED_PERMISSIONS: readonly Permission[] =
  import.meta.env.DEV && import.meta.env.VITE_MOCK_STORE_API === "true"
    ? [
        Permissions.SecretRead,
        Permissions.VariableRead,
        Permissions.VariableWrite,
        Permissions.MappingRead,
        Permissions.MappingWrite,
      ]
    : [];
