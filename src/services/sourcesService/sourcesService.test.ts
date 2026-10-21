import { apiRequest } from "@/services/apiClient/apiClient";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import {
  clearSourcesCache,
  createSource,
  deleteSource,
  getSources,
  updateSource,
} from "./sourcesService";

vi.mock("@/services/apiClient/apiClient", () => ({
  apiRequest: vi.fn(),
}));

vi.mock("@/services/tokenStore/tokenStore", () => ({
  getAccessToken: vi.fn(),
}));

const backendSources = [
  {
    id: "source-1",
    userId: "user-1",
    type: "bank",
    name: "HDFC Bank",
    accountType: "savings",
    lastFour: "4582",
    balance: 248820,
  },
  {
    id: "source-2",
    userId: "user-1",
    type: "card",
    name: "HDFC Regalia",
    lastFour: "8291",
    creditLimit: 500000,
    balance: 34680,
  },
  { id: "source-3", userId: "user-1", type: "cash", name: "Cash", balance: 12450 },
  {
    id: "source-4",
    userId: "user-1",
    type: "loan",
    name: "Home Loan",
    provider: "SBI",
    emi: 32400,
    interestRate: 8.5,
    balance: 1842000,
  },
];

describe("sourcesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAccessToken).mockReturnValue("test-token");
    clearSourcesCache();
  });

  it("loads authenticated sources, omits backend-only fields, and caches the result", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(backendSources);

    const sources = await getSources();
    expect(sources).toEqual([
      { id: "source-1", type: "bank", name: "HDFC Bank", accountType: "savings", lastFour: "4582", balance: 248820 },
      { id: "source-2", type: "card", name: "HDFC Regalia", lastFour: "8291", creditLimit: 500000, balance: 34680 },
      { id: "source-3", type: "cash", name: "Cash", balance: 12450 },
      {
        id: "source-4",
        type: "loan",
        name: "Home Loan",
        provider: "SBI",
        emi: 32400,
        interestRate: 8.5,
        balance: 1842000,
      },
    ]);
    await expect(getSources()).resolves.toEqual(sources);
    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith("/sources", { auth: true });
  });

  it("supports omitted optional fields", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce([
      { id: "source-1", type: "bank", name: "Bank", balance: 0, userId: "user-1" },
      { id: "source-2", type: "card", name: "Card", balance: 0 },
      { id: "source-3", type: "loan", name: "Loan", balance: 0 },
    ]);

    await expect(getSources()).resolves.toEqual([
      { id: "source-1", type: "bank", name: "Bank", balance: 0 },
      { id: "source-2", type: "card", name: "Card", balance: 0 },
      { id: "source-3", type: "loan", name: "Loan", balance: 0 },
    ]);
  });

  it("does not make requests without an access token", async () => {
    vi.mocked(getAccessToken).mockReturnValue(null);

    expect(() => getSources()).toThrow("An access token is required");
    await expect(createSource({ type: "cash", name: "Cash", balance: 0 })).rejects.toThrow("An access token is required");
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("posts the selected source fields with bearer authentication and invalidates the cache", async () => {
    const bankInput = { type: "bank", name: "Axis", accountType: "current", lastFour: "1234", balance: 0 } as const;
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({ id: "source-5", ...bankInput })
      .mockResolvedValueOnce(backendSources);

    await expect(createSource(bankInput)).resolves.toEqual({ id: "source-5", ...bankInput });
    expect(apiRequest).toHaveBeenNthCalledWith(1, "/sources", {
      method: "POST",
      body: bankInput,
      auth: true,
    });
    await getSources();
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/sources", { auth: true });
  });

  it("sends PUT replacement fields and invalidates the cache", async () => {
    const cardInput = { type: "card", name: "Card", balance: 1200 } as const;
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({ id: "source/1", ...cardInput })
      .mockResolvedValueOnce(backendSources);

    await updateSource("source/1", cardInput);

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/sources/source%2F1", {
      method: "PUT",
      body: cardInput,
      auth: true,
    });
    await getSources();
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/sources", { auth: true });
  });

  it("deletes a source and invalidates the cache after a 204 response", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(undefined).mockResolvedValueOnce(backendSources);

    await deleteSource("source-1");

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/sources/source-1", { method: "DELETE", auth: true });
    await getSources();
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/sources", { auth: true });
  });

  it("does not cache an in-flight response after a mutation invalidates it", async () => {
    let resolvePendingRequest!: (sources: typeof backendSources) => void;
    vi.mocked(apiRequest)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePendingRequest = resolve;
          }),
      )
      .mockResolvedValueOnce({ id: "source-5", type: "cash", name: "Cash", balance: 20 })
      .mockResolvedValueOnce([{ id: "source-5", type: "cash", name: "Cash", balance: 20 }]);

    const staleRequest = getSources();
    await createSource({ type: "cash", name: "Cash", balance: 20 });
    resolvePendingRequest(backendSources);
    await staleRequest;

    await expect(getSources()).resolves.toEqual([{ id: "source-5", type: "cash", name: "Cash", balance: 20 }]);
    expect(apiRequest).toHaveBeenCalledTimes(3);
  });

  it("clears cached data when the authenticated user changes", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(backendSources).mockResolvedValueOnce([]);

    await getSources();
    vi.mocked(getAccessToken).mockReturnValue("other-token");
    await expect(getSources()).resolves.toEqual([]);
    expect(apiRequest).toHaveBeenCalledTimes(2);
  });
});
