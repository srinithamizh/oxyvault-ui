import { apiRequest } from "@/services/apiClient/apiClient";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  sourceId: string;
  paymentId: string;
  categoryId: string;
  currency: string;
  additionalInfo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInput {
  description: string;
  amount: number;
  sourceId: string;
  paymentId: string;
  categoryId: string;
  currency: string;
  additionalInfo?: string;
  createdAt: string;
}

export interface TransactionFilters {
  page: number;
  size: number;
  sourceId?: string;
  paymentId?: string;
  categoryId?: string;
  from?: string;
  to?: string;
}

export interface TransactionPage {
  content: Transaction[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonnegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function parseTransaction(value: unknown): Transaction {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.description !== "string" ||
    typeof value.amount !== "number" ||
    !Number.isFinite(value.amount) ||
    typeof value.sourceId !== "string" ||
    typeof value.paymentId !== "string" ||
    typeof value.categoryId !== "string" ||
    typeof value.currency !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    (value.additionalInfo != null && typeof value.additionalInfo !== "string")
  ) {
    throw new Error("A transaction in the /transactions response is missing a required field.");
  }

  return {
    id: value.id,
    description: value.description,
    amount: value.amount,
    sourceId: value.sourceId,
    paymentId: value.paymentId,
    categoryId: value.categoryId,
    currency: value.currency,
    additionalInfo: value.additionalInfo as string | null | undefined,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export async function getTransactions(filters: TransactionFilters): Promise<TransactionPage> {
  const query: Record<string, string> = {
    page: String(filters.page),
    size: String(filters.size),
  };
  for (const field of ["sourceId", "paymentId", "categoryId", "from", "to"] as const) {
    const value = filters[field];
    if (value) query[field] = value;
  }

  const response = await apiRequest<unknown>("/transactions", { query, auth: true });
  if (!isRecord(response) || !Array.isArray(response.content) || !isRecord(response.page)) {
    throw new Error("Unexpected response from /transactions: expected content and page metadata.");
  }

  const { size, number, totalElements, totalPages } = response.page;
  if (
    !isNonnegativeInteger(size) ||
    !isNonnegativeInteger(number) ||
    !isNonnegativeInteger(totalElements) ||
    !isNonnegativeInteger(totalPages) ||
    size === 0
  ) {
    throw new Error("Unexpected pagination metadata from /transactions.");
  }

  return {
    content: response.content.map(parseTransaction),
    page: { size, number, totalElements, totalPages },
  };
}

export async function createTransaction(input: TransactionInput): Promise<Transaction> {
  const response = await apiRequest<unknown>("/transactions", {
    method: "POST",
    body: input,
    auth: true,
  });
  return parseTransaction(response);
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<Transaction> {
  const response = await apiRequest<unknown>(`/transactions/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  });
  return parseTransaction(response);
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiRequest<void>(`/transactions/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  });
}
