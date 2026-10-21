import { apiRequest } from "@/services/apiClient/apiClient";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import {
  clearPaymentMethodsCache,
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
} from "./paymentMethodsService";

vi.mock("@/services/apiClient/apiClient", () => ({
  apiRequest: vi.fn(),
}));

vi.mock("@/services/tokenStore/tokenStore", () => ({
  getAccessToken: vi.fn(),
}));

const backendMethods = [
  { id: "m-1", userId: "u-1", name: "UPI" },
  { id: "m-2", userId: "u-1", name: "Cash" },
];

describe("paymentMethodsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAccessToken).mockReturnValue("test-token");
    clearPaymentMethodsCache();
  });

  it("loads authenticated methods and caches/deduplicates the request", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(backendMethods);

    const first = getPaymentMethods();
    expect(getPaymentMethods()).toBe(first);
    await expect(first).resolves.toEqual([
      { id: "m-1", name: "UPI" },
      { id: "m-2", name: "Cash" },
    ]);
    await expect(getPaymentMethods()).resolves.toHaveLength(2);
    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith("/payments", { auth: true });
  });

  it("creates with a name body and invalidates the cache", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ id: "m-3", name: "Cheque" }).mockResolvedValueOnce(backendMethods);

    await expect(createPaymentMethod({ name: "Cheque" })).resolves.toEqual({ id: "m-3", name: "Cheque" });
    expect(apiRequest).toHaveBeenNthCalledWith(1, "/payments", {
      method: "POST",
      body: { name: "Cheque" },
      auth: true,
    });
    await getPaymentMethods();
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/payments", { auth: true });
  });

  it("renames with PUT and invalidates the cache", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ id: "m/1", name: "UPI / QR" }).mockResolvedValueOnce(backendMethods);

    await updatePaymentMethod("m/1", { name: "UPI / QR" });
    expect(apiRequest).toHaveBeenNthCalledWith(1, "/payments/m%2F1", {
      method: "PUT",
      body: { name: "UPI / QR" },
      auth: true,
    });
    await getPaymentMethods();
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/payments", { auth: true });
  });

  it("deletes and invalidates the cache after a 204 response", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(undefined).mockResolvedValueOnce(backendMethods);

    await deletePaymentMethod("m-1");
    expect(apiRequest).toHaveBeenNthCalledWith(1, "/payments/m-1", { method: "DELETE", auth: true });
    await getPaymentMethods();
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/payments", { auth: true });
  });

  it("does not cache a stale in-flight response after mutation invalidation", async () => {
    let resolvePending!: (methods: typeof backendMethods) => void;
    vi.mocked(apiRequest)
      .mockImplementationOnce(() => new Promise((resolve) => {
        resolvePending = resolve;
      }))
      .mockResolvedValueOnce({ id: "m-3", name: "Cheque" })
      .mockResolvedValueOnce([{ id: "m-3", name: "Cheque" }]);

    const staleRequest = getPaymentMethods();
    await createPaymentMethod({ name: "Cheque" });
    resolvePending(backendMethods);
    await staleRequest;
    await expect(getPaymentMethods()).resolves.toEqual([{ id: "m-3", name: "Cheque" }]);
    expect(apiRequest).toHaveBeenCalledTimes(3);
  });

  it("does not request methods without an access token", async () => {
    vi.mocked(getAccessToken).mockReturnValue(null);

    expect(() => getPaymentMethods()).toThrow("An access token is required");
    await expect(createPaymentMethod({ name: "Cheque" })).rejects.toThrow("An access token is required");
    expect(apiRequest).not.toHaveBeenCalled();
  });
});
