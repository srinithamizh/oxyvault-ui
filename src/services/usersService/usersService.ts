import { apiRequest } from "@/services/apiClient/apiClient";
import { isUserRole, type UserRole } from "@/types/user";

export interface ManagedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface UserPage {
  content: ManagedUser[];
  first: boolean;
  last: boolean;
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface UserResponse extends Omit<ManagedUser, "role"> {
  role: string;
}

interface UserPageResponse extends Omit<UserPage, "content"> {
  content: UserResponse[];
}

function parseUser(user: UserResponse): ManagedUser {
  const role = user.role.toLowerCase();
  if (!isUserRole(role)) throw new Error("Unexpected role in /users response.");
  return { ...user, role };
}

export async function getUsers(page: number, size: number): Promise<UserPage> {
  const response = await apiRequest<UserPageResponse>("/users", {
    query: { page: String(page), size: String(size) },
  });

  if (
    !response ||
    !Array.isArray(response.content) ||
    typeof response.first !== "boolean" ||
    typeof response.last !== "boolean" ||
    !Number.isInteger(response.number) ||
    !Number.isInteger(response.size) ||
    !Number.isInteger(response.totalElements) ||
    !Number.isInteger(response.totalPages)
  ) {
    throw new Error("Unexpected response from /users.");
  }

  return { ...response, content: response.content.map(parseUser) };
}

export async function updateUserRole(id: string, role: UserRole): Promise<void> {
  await apiRequest<void>(`/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: { role: role.toUpperCase() },
  });
}
