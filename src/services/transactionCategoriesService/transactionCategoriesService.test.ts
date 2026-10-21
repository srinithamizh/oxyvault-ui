import { apiRequest } from "@/services/apiClient/apiClient";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import {
  clearCategoriesCache,
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./transactionCategoriesService";

vi.mock("@/services/apiClient/apiClient", () => ({
  apiRequest: vi.fn(),
}));

vi.mock("@/services/tokenStore/tokenStore", () => ({
  getAccessToken: vi.fn(),
}));

const backendCategories = [
  { id: "cat-1", name: "Salary", userId: "user-1", type: "INCOME" },
  { id: "cat-2", name: "Rent", userId: "user-1", type: "EXPENSE" },
];

describe("transactionCategoriesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAccessToken).mockReturnValue("test-token");
    clearCategoriesCache();
  });

  it("loads and normalizes categories, caching and deduplicating requests", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(backendCategories);

    const firstRequest = getCategories();
    const secondRequest = getCategories();
    expect(secondRequest).toBe(firstRequest);

    await expect(firstRequest).resolves.toEqual([
      { id: "cat-1", name: "Salary", type: "income" },
      { id: "cat-2", name: "Rent", type: "expense" },
    ]);
    await expect(getCategories()).resolves.toHaveLength(2);
    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith("/categories", { auth: true });
  });

  it("posts uppercase category types and invalidates the cache", async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({ id: "cat-3", name: "Bonus", type: "INCOME" })
      .mockResolvedValueOnce(backendCategories);

    await expect(createCategory({ name: "Bonus", type: "income" })).resolves.toEqual({
      id: "cat-3",
      name: "Bonus",
      type: "income",
    });
    expect(apiRequest).toHaveBeenNthCalledWith(1, "/categories", {
      method: "POST",
      body: { name: "Bonus", type: "INCOME" },
      auth: true,
    });
    await getCategories();
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/categories", { auth: true });
  });

  it("replaces a category using PUT and invalidates the cache", async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({ id: "cat/1", name: "New rent", type: "EXPENSE" })
      .mockResolvedValueOnce(backendCategories);

    await updateCategory("cat/1", { name: "New rent", type: "expense" });

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/categories/cat%2F1", {
      method: "PUT",
      body: { name: "New rent", type: "EXPENSE" },
      auth: true,
    });
    await getCategories();
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/categories", { auth: true });
  });

  it("deletes a category and invalidates the cache after a 204 response", async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(backendCategories);

    await deleteCategory("cat-1");

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/categories/cat-1", { method: "DELETE", auth: true });
    await getCategories();
    expect(apiRequest).toHaveBeenNthCalledWith(2, "/categories", { auth: true });
  });

  it("does not cache an in-flight response after a mutation invalidates it", async () => {
    let resolvePendingRequest!: (categories: typeof backendCategories) => void;
    vi.mocked(apiRequest)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePendingRequest = resolve;
          }),
      )
      .mockResolvedValueOnce({ id: "cat-3", name: "Bonus", type: "INCOME" })
      .mockResolvedValueOnce([{ id: "cat-3", name: "Bonus", type: "INCOME" }]);

    const staleRequest = getCategories();
    await createCategory({ name: "Bonus", type: "income" });
    resolvePendingRequest(backendCategories);
    await staleRequest;

    await expect(getCategories()).resolves.toEqual([{ id: "cat-3", name: "Bonus", type: "income" }]);
    expect(apiRequest).toHaveBeenCalledTimes(3);
  });
});
