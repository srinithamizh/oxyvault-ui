import { apiRequest } from "@/services/apiClient/apiClient";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import {
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
  });

  it("loads authenticated sources and omits backend-only fields", async () => {
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

    await expect(getSources()).rejects.toThrow("An access token is required");
    await expect(createSource({ type: "cash", name: "Cash", balance: 0 })).rejects.toThrow("An access token is required");
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("posts the selected source fields with bearer authentication", async () => {
    const bankInput = { type: "bank", name: "Axis", accountType: "current", lastFour: "1234", balance: 0 } as const;
    vi.mocked(apiRequest).mockResolvedValueOnce({ id: "source-5", ...bankInput });

    await expect(createSource(bankInput)).resolves.toEqual({ id: "source-5", ...bankInput });
    expect(apiRequest).toHaveBeenNthCalledWith(1, "/sources", {
      method: "POST",
      body: bankInput,
      auth: true,
    });
  });

  it("sends PUT replacement fields", async () => {
    const cardInput = { type: "card", name: "Card", balance: 1200 } as const;
    vi.mocked(apiRequest).mockResolvedValueOnce({ id: "source/1", ...cardInput });

    await updateSource("source/1", cardInput);

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/sources/source%2F1", {
      method: "PUT",
      body: cardInput,
      auth: true,
    });
  });

  it("deletes a source after a 204 response", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(undefined);

    await deleteSource("source-1");

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/sources/source-1", { method: "DELETE", auth: true });
  });
});
