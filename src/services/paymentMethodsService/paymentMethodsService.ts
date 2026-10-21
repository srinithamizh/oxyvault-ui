import { apiRequest } from "@/services/apiClient/apiClient";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import type { PaymentMethod, PaymentMethodInput } from "@/types/transactionOptions";

interface PaymentMethodResponse {
  id: string;
  name: string;
}

function parsePaymentMethod(response: PaymentMethodResponse): PaymentMethod {
  if (!response || typeof response.id !== "string" || typeof response.name !== "string") {
    throw new Error("Unexpected payment method returned by the server.");
  }
  return { id: response.id, name: response.name };
}

function requireAccessToken() {
  if (!getAccessToken()) throw new Error("An access token is required to request payment methods.");
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  requireAccessToken();
  const response = await apiRequest<PaymentMethodResponse[]>("/payments", { auth: true });
  if (!Array.isArray(response)) throw new Error("Unexpected response from /payments.");
  return response.map(parsePaymentMethod);
}

export async function createPaymentMethod(input: PaymentMethodInput): Promise<PaymentMethod> {
  requireAccessToken();
  const response = await apiRequest<PaymentMethodResponse>("/payments", {
    method: "POST",
    body: input,
    auth: true,
  });
  return parsePaymentMethod(response);
}

export async function updatePaymentMethod(id: string, input: PaymentMethodInput): Promise<PaymentMethod> {
  requireAccessToken();
  const response = await apiRequest<PaymentMethodResponse>(`/payments/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: input,
    auth: true,
  });
  return parsePaymentMethod(response);
}

export async function deletePaymentMethod(id: string): Promise<void> {
  requireAccessToken();
  await apiRequest<void>(`/payments/${encodeURIComponent(id)}`, { method: "DELETE", auth: true });
}
