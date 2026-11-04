export const Permissions = {
  StatusRead: "status:read",
  PlaybookRead: "playbook:read",
  PlaybookWrite: "playbook:write",
  PlaybookExecute: "playbook:execute",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
