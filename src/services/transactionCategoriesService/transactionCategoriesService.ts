import { apiRequest } from "@/services/apiClient/apiClient";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import type { CategoryType, TransactionCategory, TransactionCategoryInput } from "@/types/transactionOptions";

interface CategoryResponse {
  id: string;
  name: string;
  type: string;
}

let categoriesCache: TransactionCategory[] | null = null;
let categoriesRequest: Promise<TransactionCategory[]> | null = null;
let cacheToken: string | null = null;
let cacheVersion = 0;

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

function ensureCacheUser() {
  const token = getAccessToken();
  if (token !== cacheToken) {
    cacheVersion += 1;
    categoriesCache = null;
    categoriesRequest = null;
    cacheToken = token;
  }
}

export function clearCategoriesCache() {
  cacheVersion += 1;
  categoriesCache = null;
  categoriesRequest = null;
  cacheToken = getAccessToken();
}

export function getCategories(): Promise<TransactionCategory[]> {
  ensureCacheUser();
  if (categoriesCache) return Promise.resolve(categoriesCache);
  if (categoriesRequest) return categoriesRequest;

  const requestVersion = cacheVersion;
  const request = apiRequest<CategoryResponse[]>("/categories", { auth: true })
    .then((response) => {
      if (!Array.isArray(response)) throw new Error("Unexpected response from /categories.");
      const result = response.map(parseCategory);
      if (requestVersion === cacheVersion) categoriesCache = result;
      return result;
    })
    .finally(() => {
      if (categoriesRequest === request) categoriesRequest = null;
    });
  categoriesRequest = request;

  return request;
}

export async function createCategory(input: TransactionCategoryInput): Promise<TransactionCategory> {
  const response = await apiRequest<CategoryResponse>("/categories", {
    method: "POST",
    body: { name: input.name, type: input.type.toUpperCase() },
    auth: true,
  });
  clearCategoriesCache();
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
  clearCategoriesCache();
  return parseCategory(response);
}

export async function deleteCategory(id: string): Promise<void> {
  await apiRequest<void>(`/categories/${encodeURIComponent(id)}`, { method: "DELETE", auth: true });
  clearCategoriesCache();
}
