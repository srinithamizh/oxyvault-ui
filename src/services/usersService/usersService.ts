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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function integerOr(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isInteger(value) ? value : fallback;
}

function parseUser(value: unknown): ManagedUser {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.username !== "string" ||
    typeof value.email !== "string" ||
    typeof value.role !== "string"
  ) {
    throw new Error("A user in the /admin/users response is missing a required field.");
  }

  const normalizedRole = value.role.replace(/^ROLE_/, "").toLowerCase();
  if (!isUserRole(normalizedRole)) throw new Error("A user in the /admin/users response has an unknown role.");
  return {
    id: value.id,
    name: value.name,
    username: value.username,
    email: value.email,
    role: normalizedRole,
  };
}

export async function getUsers(page: number, size: number): Promise<UserPage> {
  const response = await apiRequest<unknown>("/admin/users", {
    query: { page: String(page), size: String(size) },
  });

  if (!isRecord(response) || !Array.isArray(response.content)) {
    throw new Error("Unexpected response from /admin/users: expected a page with a content array.");
  }

  const pageable = isRecord(response.pageable) ? response.pageable : {};
  const pageNumber = integerOr(response.number, integerOr(pageable.pageNumber, page));
  const pageSize = integerOr(response.size, integerOr(pageable.pageSize, size));
  const totalElements = integerOr(response.totalElements, response.content.length);
  const totalPages = integerOr(response.totalPages, Math.ceil(totalElements / Math.max(pageSize, 1)));
  const users = response.content.map(parseUser);

  return {
    content: users,
    number: pageNumber,
    size: pageSize,
    totalElements,
    totalPages,
    first: typeof response.first === "boolean" ? response.first : pageNumber === 0,
    last: typeof response.last === "boolean" ? response.last : pageNumber >= totalPages - 1,
  };
}

export async function updateUserRole(id: string, role: UserRole): Promise<void> {
  await apiRequest<void>(`/admin/users/${encodeURIComponent(id)}/role`, {
    method: "PATCH",
    body: { role: role.toUpperCase() },
  });
}
