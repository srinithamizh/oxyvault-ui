import { apiRequest } from "@/services/apiClient/apiClient";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./transactionCategoriesService";

vi.mock("@/services/apiClient/apiClient", () => ({
  apiRequest: vi.fn(),
}));

const backendCategories = [
  { id: "cat-1", name: "Salary", userId: "user-1", type: "INCOME" },
  { id: "cat-2", name: "Rent", userId: "user-1", type: "EXPENSE" },
];

describe("transactionCategoriesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and normalizes categories", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(backendCategories);

    await expect(getCategories()).resolves.toEqual([
      { id: "cat-1", name: "Salary", type: "income" },
      { id: "cat-2", name: "Rent", type: "expense" },
    ]);
    expect(apiRequest).toHaveBeenCalledTimes(1);
    expect(apiRequest).toHaveBeenCalledWith("/categories", { auth: true });
  });

  it("posts uppercase category types", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ id: "cat-3", name: "Bonus", type: "INCOME" });

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
  });

  it("replaces a category using PUT", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ id: "cat/1", name: "New rent", type: "EXPENSE" });

    await updateCategory("cat/1", { name: "New rent", type: "expense" });

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/categories/cat%2F1", {
      method: "PUT",
      body: { name: "New rent", type: "EXPENSE" },
      auth: true,
    });
  });

  it("deletes a category after a 204 response", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce(undefined);

    await deleteCategory("cat-1");

    expect(apiRequest).toHaveBeenNthCalledWith(1, "/categories/cat-1", { method: "DELETE", auth: true });
  });
});
