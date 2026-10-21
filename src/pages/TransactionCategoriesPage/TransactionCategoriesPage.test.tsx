import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionCategoriesPage from "./TransactionCategoriesPage";
import { renderWithProviders } from "@/test/renderWithProviders";
import type { TransactionCategory } from "@/types/transactionOptions";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/services/transactionCategoriesService/transactionCategoriesService";

vi.mock("@/services/transactionCategoriesService/transactionCategoriesService", () => ({
  getCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

const testCategories: TransactionCategory[] = [
  { id: "c-1", name: "Salary", type: "income" },
  { id: "c-2", name: "Side income", type: "income" },
  { id: "c-3", name: "Interest", type: "income" },
  { id: "c-4", name: "Food & dining", type: "expense" },
  { id: "c-5", name: "Transport", type: "expense" },
  { id: "c-6", name: "Shopping", type: "expense" },
  { id: "c-7", name: "Utilities", type: "expense" },
  { id: "c-8", name: "Rent", type: "expense" },
  { id: "c-9", name: "Health", type: "expense" },
  { id: "c-10", name: "Entertainment", type: "expense" },
];

const list = () => screen.getByRole("list", { name: "Categories" });
const renderPage = () => renderWithProviders(<TransactionCategoriesPage />, { initialCategories: testCategories });
let categoriesOnServer = testCategories;

describe("TransactionCategoriesPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    categoriesOnServer = [...testCategories];
    vi.mocked(getCategories).mockImplementation(async () => categoriesOnServer);
    vi.mocked(createCategory).mockImplementation(async (input) => {
      const created = { ...input, id: "c-new" };
      categoriesOnServer = [...categoriesOnServer, created];
      return created;
    });
    vi.mocked(updateCategory).mockImplementation(async (id, input) => {
      const updated = { ...input, id };
      categoriesOnServer = categoriesOnServer.map((category) => (category.id === id ? updated : category));
      return updated;
    });
    vi.mocked(deleteCategory).mockImplementation(async (id) => {
      categoriesOnServer = categoriesOnServer.filter((category) => category.id !== id);
    });
  });

  it("lists the default categories and nothing else", () => {
    renderPage();
    expect(within(list()).getByText("Salary")).toBeInTheDocument();
    expect(within(list()).getByText("Food & dining")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Payment methods" })).not.toBeInTheDocument();
  });

  it("marks each category as income or expense", () => {
    renderPage();
    const items = within(list()).getAllByRole("listitem");
    expect(within(items[0]).getByText("Income")).toBeInTheDocument();
    expect(within(items[3]).getByText("Expense")).toBeInTheDocument();
  });

  it("hides edit and delete until Edit is pressed", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.queryByRole("button", { name: /^Delete / })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit categories" }));
    expect(screen.getAllByRole("button", { name: /^Delete / })).toHaveLength(10);
    await user.click(screen.getByRole("button", { name: "Done editing categories" }));
    expect(screen.queryByRole("button", { name: /^Delete / })).not.toBeInTheDocument();
  });

  it("adds an income category", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Add category" }));
    await user.type(screen.getByRole("textbox", { name: "Category name" }), "Dividends");
    await user.click(screen.getByRole("radio", { name: "Income" }));
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(await within(list()).findByText("Dividends")).toBeInTheDocument();
    expect(vi.mocked(createCategory).mock.calls[0]?.[0]).toEqual({ name: "Dividends", type: "income" });
  });

  it("changes a category's type when editing", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Edit categories" }));
    await user.click(screen.getByRole("button", { name: "Edit Rent" }));
    await user.click(screen.getByRole("radio", { name: "Income" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() => {
      const rentItem = within(list()).getAllByRole("listitem")[7];
      expect(within(rentItem).getByText("Income")).toBeInTheDocument();
    });
  });

  it("deletes a category after confirmation and keeps it when cancelled", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Edit categories" }));
    await user.click(screen.getByRole("button", { name: "Delete Rent" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(within(list()).getByText("Rent")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete Rent" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(within(list()).queryByText("Rent")).not.toBeInTheDocument());
  });
});
