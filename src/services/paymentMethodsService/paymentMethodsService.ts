import { apiRequest } from "@/services/apiClient/apiClient";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import type { PaymentMethod, PaymentMethodInput } from "@/types/transactionOptions";

interface PaymentMethodResponse {
  id: string;
  name: string;
}

let methodsCache: PaymentMethod[] | null = null;
let methodsRequest: Promise<PaymentMethod[]> | null = null;
let cacheToken: string | null = null;
let cacheVersion = 0;

function parsePaymentMethod(response: PaymentMethodResponse): PaymentMethod {
  if (!response || typeof response.id !== "string" || typeof response.name !== "string") {
    throw new Error("Unexpected payment method returned by the server.");
  }
  return { id: response.id, name: response.name };
}

function requireAccessToken() {
  if (!getAccessToken()) throw new Error("An access token is required to request payment methods.");
}

function ensureCacheUser() {
  const token = getAccessToken();
  if (token !== cacheToken) {
    cacheVersion += 1;
    methodsCache = null;
    methodsRequest = null;
    cacheToken = token;
  }
}

export function clearPaymentMethodsCache() {
  cacheVersion += 1;
  methodsCache = null;
  methodsRequest = null;
  cacheToken = getAccessToken();
}

export function getPaymentMethods(): Promise<PaymentMethod[]> {
  requireAccessToken();
  ensureCacheUser();
  if (methodsCache) return Promise.resolve(methodsCache);
  if (methodsRequest) return methodsRequest;

  const requestVersion = cacheVersion;
  const request = apiRequest<PaymentMethodResponse[]>("/payments", { auth: true })
    .then((response) => {
      if (!Array.isArray(response)) throw new Error("Unexpected response from /payments.");
      const result = response.map(parsePaymentMethod);
      if (requestVersion === cacheVersion) methodsCache = result;
      return result;
    })
    .finally(() => {
      if (methodsRequest === request) methodsRequest = null;
    });
  methodsRequest = request;
  return request;
}

export async function createPaymentMethod(input: PaymentMethodInput): Promise<PaymentMethod> {
  requireAccessToken();
  const response = await apiRequest<PaymentMethodResponse>("/payments", {
    method: "POST",
    body: input,
    auth: true,
  });
  clearPaymentMethodsCache();
  return parsePaymentMethod(response);
}

export async function updatePaymentMethod(id: string, input: PaymentMethodInput): Promise<PaymentMethod> {
  requireAccessToken();
  const response = await apiRequest<PaymentMethodResponse>(`/payments/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  });
  clearPaymentMethodsCache();
  return parsePaymentMethod(response);
}

export async function deletePaymentMethod(id: string): Promise<void> {
  requireAccessToken();
  await apiRequest<void>(`/payments/${encodeURIComponent(id)}`, { method: "DELETE", auth: true });
  clearPaymentMethodsCache();
}
