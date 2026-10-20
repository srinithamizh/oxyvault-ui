/** The two roles an account can have. */
export const UserRole = {
  Admin: "admin",
  User: "user",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const USER_ROLES: readonly UserRole[] = Object.values(UserRole);

export function isUserRole(value: unknown): value is UserRole {
  return USER_ROLES.some((role) => role === value);
}

/** The user details shown in the UI chrome (sidebar, profile menu). */
export interface UserSummary {
  name: string;
  role: UserRole;
}
