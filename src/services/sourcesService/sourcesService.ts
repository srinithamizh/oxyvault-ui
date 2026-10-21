import { apiRequest } from "@/services/apiClient/apiClient";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import type { Source, SourceInput, SourceType } from "@/types/source";

interface SourceResponse {
  id: string;
  type: string;
  name: string;
  accountType?: string | null;
  lastFour?: string | null;
  balance: number;
  creditLimit?: number | null;
  provider?: string | null;
  emi?: number | null;
  interestRate?: number | null;
}

function parseSource(response: SourceResponse): Source {
  if (
    !response ||
    typeof response.id !== "string" ||
    typeof response.name !== "string" ||
    typeof response.balance !== "number" ||
    !Number.isFinite(response.balance) ||
    response.balance < 0
  ) {
    throw new Error("Unexpected source returned by the server.");
  }

  switch (response.type as SourceType) {
    case "bank":
      if (response.accountType != null && response.accountType !== "savings" && response.accountType !== "current") {
        throw new Error("Unexpected bank account type returned by the server.");
      }
      if (response.lastFour != null && typeof response.lastFour !== "string") {
        throw new Error("Unexpected bank account number returned by the server.");
      }
      return {
        id: response.id,
        type: "bank",
        name: response.name,
        balance: response.balance,
        ...(response.accountType != null ? { accountType: response.accountType } : {}),
        ...(response.lastFour != null ? { lastFour: response.lastFour } : {}),
      };
    case "card":
      if (response.lastFour != null && typeof response.lastFour !== "string") {
        throw new Error("Unexpected card number returned by the server.");
      }
      if (
        response.creditLimit != null &&
        (typeof response.creditLimit !== "number" || !Number.isFinite(response.creditLimit) || response.creditLimit < 0)
      ) {
        throw new Error("Unexpected credit limit returned by the server.");
      }
      return {
        id: response.id,
        type: "card",
        name: response.name,
        balance: response.balance,
        ...(response.lastFour != null ? { lastFour: response.lastFour } : {}),
        ...(response.creditLimit != null ? { creditLimit: response.creditLimit } : {}),
      };
    case "cash":
      return { id: response.id, type: "cash", name: response.name, balance: response.balance };
    case "loan":
      if (response.provider != null && typeof response.provider !== "string") {
        throw new Error("Unexpected loan provider returned by the server.");
      }
      for (const value of [response.emi, response.interestRate]) {
        if (value != null && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
          throw new Error("Unexpected loan details returned by the server.");
        }
      }
      return {
        id: response.id,
        type: "loan",
        name: response.name,
        balance: response.balance,
        ...(response.provider != null ? { provider: response.provider } : {}),
        ...(response.emi != null ? { emi: response.emi } : {}),
        ...(response.interestRate != null ? { interestRate: response.interestRate } : {}),
      };
    default:
      throw new Error("Unexpected source type returned by the server.");
  }
}

function toRequestBody(input: SourceInput) {
  return { ...input };
}

function requireAccessToken() {
  if (!getAccessToken()) throw new Error("An access token is required to request sources.");
}

export async function getSources(): Promise<Source[]> {
  requireAccessToken();
  const response = await apiRequest<SourceResponse[]>("/sources", { auth: true });
  if (!Array.isArray(response)) throw new Error("Unexpected response from /sources.");
  return response.map(parseSource);
}

export async function createSource(input: SourceInput): Promise<Source> {
  requireAccessToken();
  const response = await apiRequest<SourceResponse>("/sources", {
    method: "POST",
    body: toRequestBody(input),
    auth: true,
  });
  return parseSource(response);
}

export async function updateSource(id: string, input: SourceInput): Promise<Source> {
  requireAccessToken();
  const response = await apiRequest<SourceResponse>(`/sources/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: toRequestBody(input),
    auth: true,
  });
  return parseSource(response);
}

export async function deleteSource(id: string): Promise<void> {
  requireAccessToken();
  await apiRequest<void>(`/sources/${encodeURIComponent(id)}`, { method: "DELETE", auth: true });
}
