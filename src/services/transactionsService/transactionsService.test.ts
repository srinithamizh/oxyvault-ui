import { apiRequest } from "@/services/apiClient/apiClient";
import { createTransaction, deleteTransaction, getTransactions, updateTransaction } from "./transactionsService";

vi.mock("@/services/apiClient/apiClient", () => ({
  apiRequest: vi.fn(),
}));

const transaction = {
  id: "txn-1",
  description: "Lunch",
  amount: 250.5,
  sourceId: "source-1",
  paymentId: "payment-1",
  categoryId: "category-1",
  currency: "INR",
  additionalInfo: "Cafe",
  createdAt: "2026-10-21T10:15:30Z",
  updatedAt: "2026-10-21T10:15:30Z",
};
const validInput = {
  description: "Lunch",
  amount: 250.5,
  sourceId: "source-1",
  paymentId: "payment-1",
  categoryId: "category-1",
  currency: "INR",
  additionalInfo: "Cafe",
  createdAt: "2026-10-21T10:15:30Z",
};

describe("transactionsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("gets a page of transactions with all optional filters", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      content: [transaction],
      page: { size: 25, number: 0, totalElements: 1, totalPages: 1 },
    });

    await expect(getTransactions({
      page: 0,
      size: 25,
      sourceId: "source-1",
      paymentId: "payment-1",
      categoryId: "category-1",
      from: "2026-10-01T00:00:00Z",
      to: "2026-10-31T23:59:59Z",
    })).resolves.toEqual({
      content: [transaction],
      page: { size: 25, number: 0, totalElements: 1, totalPages: 1 },
    });

    expect(apiRequest).toHaveBeenCalledWith("/transactions", {
      query: {
        page: "0",
        size: "25",
        sourceId: "source-1",
        paymentId: "payment-1",
        categoryId: "category-1",
        from: "2026-10-01T00:00:00Z",
        to: "2026-10-31T23:59:59Z",
      },
      auth: true,
    });
  });

  it("omits empty filters and rejects malformed page responses", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      content: [],
      page: { size: 25, number: 0, totalElements: 0, totalPages: 0 },
    });

    await expect(getTransactions({ page: 0, size: 25, sourceId: "" })).resolves.toMatchObject({ content: [] });
    expect(apiRequest).toHaveBeenCalledWith("/transactions", {
      query: { page: "0", size: "25" },
      auth: true,
    });

    vi.mocked(apiRequest).mockResolvedValueOnce({ content: [], page: {} });
    await expect(getTransactions({ page: 0, size: 25 })).rejects.toThrow("pagination metadata");
  });

  it("posts transaction fields with the selected relationship ids", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(transaction);
    const input = {
      description: "Lunch",
      amount: 250.5,
      sourceId: "source-1",
      paymentId: "payment-1",
      categoryId: "category-1",
      currency: "INR",
      additionalInfo: "Cafe",
      createdAt: "2026-10-21T10:15:30Z",
    };

    await expect(createTransaction(input)).resolves.toEqual(transaction);
    expect(apiRequest).toHaveBeenCalledWith("/transactions", {
      method: "POST",
      body: input,
      auth: true,
    });
  });

  it("updates a transaction by id", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(transaction);

    await expect(updateTransaction("txn-1", validInput)).resolves.toEqual(transaction);
    expect(apiRequest).toHaveBeenCalledWith("/transactions/txn-1", {
      method: "PUT",
      body: validInput,
      auth: true,
    });
  });

  it("encodes the transaction id when deleting", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(undefined);

    await expect(deleteTransaction("txn/1")).resolves.toBeUndefined();
    expect(apiRequest).toHaveBeenCalledWith("/transactions/txn%2F1", {
      method: "DELETE",
      auth: true,
    });
  });

  it("rejects an invalid transaction returned from the API", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ id: "txn-1" });
    await expect(createTransaction(validInput)).rejects.toThrow("missing a required field");
  });
});
