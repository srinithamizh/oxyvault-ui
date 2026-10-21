import { apiRequest } from "@/services/apiClient/apiClient";

export async function checkBackendHealth(signal?: AbortSignal): Promise<void> {
  await apiRequest<void>("/health", {
    auth: false,
    expectedStatus: 200,
    method: "GET",
    showLoader: false,
    signal,
  });
}
