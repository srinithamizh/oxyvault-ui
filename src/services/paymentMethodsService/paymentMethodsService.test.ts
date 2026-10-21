import { apiRequest } from "@/services/apiClient/apiClient";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import {
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
  });

  it("loads authenticated methods", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(backendMethods);

    await expect(getPaymentMethods()).resolves.toEqual([
      { id: "m-1", name: "UPI" },
      { id: "m-2", name: "Cash" },
    ]);
    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith("/payments", { auth: true });
  });

  it("creates with a name body", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ id: "m-3", name: "Cheque" });

    await expect(createPaymentMethod({ name: "Cheque" })).resolves.toEqual({ id: "m-3", name: "Cheque" });
    expect(apiRequest).toHaveBeenNthCalledWith(1, "/payments", {
      method: "POST",
      body: { name: "Cheque" },
      auth: true,
    });
  });

  it("renames with PUT", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ id: "m/1", name: "UPI / QR" });

    await updatePaymentMethod("m/1", { name: "UPI / QR" });
    expect(apiRequest).toHaveBeenNthCalledWith(1, "/payments/m%2F1", {
      method: "PUT",
      body: { name: "UPI / QR" },
      auth: true,
    });
  });

  it("deletes after a 204 response", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(undefined);

    await deletePaymentMethod("m-1");
    expect(apiRequest).toHaveBeenNthCalledWith(1, "/payments/m-1", { method: "DELETE", auth: true });
  });

  it("does not request methods without an access token", async () => {
    vi.mocked(getAccessToken).mockReturnValue(null);

    await expect(getPaymentMethods()).rejects.toThrow("An access token is required");
    await expect(createPaymentMethod({ name: "Cheque" })).rejects.toThrow("An access token is required");
    expect(apiRequest).not.toHaveBeenCalled();
  });
});
