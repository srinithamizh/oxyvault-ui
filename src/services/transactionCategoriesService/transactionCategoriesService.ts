import { apiRequest } from "@/services/apiClient/apiClient";
import type { CategoryType, TransactionCategory, TransactionCategoryInput } from "@/types/transactionOptions";

interface CategoryResponse {
  id: string;
  name: string;
  type: string;
}

function normalizeType(type: string): CategoryType {
  const normalized = type.toLowerCase();
  if (normalized !== "income" && normalized !== "expense") {
    throw new Error("Unexpected category type returned by the server.");
  }
  return normalized;
}

function parseCategory(category: CategoryResponse): TransactionCategory {
  if (
    !category ||
    typeof category.id !== "string" ||
    typeof category.name !== "string" ||
    typeof category.type !== "string"
  ) {
    throw new Error("Unexpected category returned by the server.");
  }
  return { id: category.id, name: category.name, type: normalizeType(category.type) };
}

export async function getCategories(): Promise<TransactionCategory[]> {
  const response = await apiRequest<CategoryResponse[]>("/categories", { auth: true });
  if (!Array.isArray(response)) throw new Error("Unexpected response from /categories.");
  return response.map(parseCategory);
}

export async function createCategory(input: TransactionCategoryInput): Promise<TransactionCategory> {
  const response = await apiRequest<CategoryResponse>("/categories", {
    method: "POST",
    body: { name: input.name, type: input.type.toUpperCase() },
    auth: true,
  });
  return parseCategory(response);
}

export async function updateCategory(
  id: string,
  input: TransactionCategoryInput,
): Promise<TransactionCategory> {
  const response = await apiRequest<CategoryResponse>(`/categories/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: { name: input.name, type: input.type.toUpperCase() },
    auth: true,
  });
  return parseCategory(response);
}

export async function deleteCategory(id: string): Promise<void> {
  await apiRequest<void>(`/categories/${encodeURIComponent(id)}`, { method: "DELETE", auth: true });
}
