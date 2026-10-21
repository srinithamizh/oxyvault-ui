import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReportsPage from "./ReportsPage";
import { renderWithProviders } from "@/test/renderWithProviders";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "@/services/transactionsService/transactionsService";
import type { TransactionPage } from "@/services/transactionsService/transactionsService";
import type { TransactionCategory } from "@/types/transactionOptions";
import {
  createSource,
  getSources,
} from "@/services/sourcesService/sourcesService";
import {
  createPaymentMethod,
  getPaymentMethods,
} from "@/services/paymentMethodsService/paymentMethodsService";
import {
  createCategory,
  getCategories,
} from "@/services/transactionCategoriesService/transactionCategoriesService";
import { setAccessToken } from "@/services/tokenStore/tokenStore";
import { testSources } from "@/test/fixtures/sources";
import { testPaymentMethods } from "@/test/fixtures/paymentMethods";

vi.mock("@/services/transactionsService/transactionsService", () => ({
  createTransaction: vi.fn(),
  deleteTransaction: vi.fn(),
  getTransactions: vi.fn(),
  updateTransaction: vi.fn(),
}));

vi.mock("@/services/sourcesService/sourcesService", () => ({
  createSource: vi.fn(),
  deleteSource: vi.fn(),
  getSources: vi.fn(),
  updateSource: vi.fn(),
}));

vi.mock("@/services/paymentMethodsService/paymentMethodsService", () => ({
  createPaymentMethod: vi.fn(),
  deletePaymentMethod: vi.fn(),
  getPaymentMethods: vi.fn(),
  updatePaymentMethod: vi.fn(),
}));

vi.mock("@/services/transactionCategoriesService/transactionCategoriesService", () => ({
  createCategory: vi.fn(),
  deleteCategory: vi.fn(),
  getCategories: vi.fn(),
  updateCategory: vi.fn(),
}));

const categories: TransactionCategory[] = [
  { id: "category-expense", name: "Food", type: "expense" },
  { id: "category-income", name: "Salary", type: "income" },
];

const row = {
  id: "txn-1",
  description: "Lunch",
  amount: 250.5,
  sourceId: "s-1",
  paymentId: "m-1",
  categoryId: "category-expense",
  currency: "INR",
  additionalInfo: "Cafe",
  createdAt: "2026-10-21T10:15:30Z",
  updatedAt: "2026-10-21T10:15:30Z",
};

function page(number = 0): TransactionPage {
  return {
    content: [row],
    page: { size: 25, number, totalElements: 26, totalPages: 2 },
  };
}

function renderReports() {
  return renderWithProviders(<ReportsPage />, {
    route: "/reports",
    initialCategories: categories,
  });
}

describe("ReportsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    setAccessToken("test-token");
    vi.mocked(getTransactions).mockResolvedValue(page());
    vi.mocked(createTransaction).mockResolvedValue(row);
    vi.mocked(updateTransaction).mockResolvedValue({ ...row, description: "Updated lunch" });
    vi.mocked(deleteTransaction).mockResolvedValue(undefined);
    vi.mocked(getSources).mockResolvedValue(testSources);
    vi.mocked(createSource).mockResolvedValue(testSources[2]);
    vi.mocked(getPaymentMethods).mockResolvedValue(testPaymentMethods);
    vi.mocked(createPaymentMethod).mockResolvedValue(testPaymentMethods[0]);
    vi.mocked(getCategories).mockResolvedValue(categories);
    vi.mocked(createCategory).mockResolvedValue(categories[0]);
  });

  it("loads source, payment, and category options from their shared providers when needed", async () => {
    renderWithProviders(<ReportsPage />, {
      route: "/reports",
      initialSources: null,
      initialMethods: null,
      initialCategories: null,
    });

    await screen.findByText("Lunch");
    await waitFor(() => {
      expect(getSources).toHaveBeenCalledTimes(1);
      expect(getPaymentMethods).toHaveBeenCalledTimes(1);
      expect(getCategories).toHaveBeenCalledTimes(1);
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    const dialog = screen.getByRole("dialog", { name: "Add transaction" });
    await user.click(within(dialog).getByRole("combobox", { name: "Source" }));
    expect(screen.getByRole("option", { name: "HDFC Bank" })).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "HDFC Bank" }));
    await user.click(within(dialog).getByRole("combobox", { name: "Payment method" }));
    expect(screen.getByRole("option", { name: "UPI" })).toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "UPI" }));
    await user.click(within(dialog).getByRole("combobox", { name: "Category" }));
    expect(screen.getByRole("option", { name: "Food" })).toBeInTheDocument();
  });

  it("shows a paginated transaction table with labels from shared data", async () => {
    renderReports();

    expect(await screen.findByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText("Cafe")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("HDFC Bank")).toBeInTheDocument();
    expect(screen.getByText("UPI")).toBeInTheDocument();
    expect(screen.getByText("Showing 1–1 of 26 transactions")).toBeInTheDocument();
    expect(getTransactions).toHaveBeenCalledWith({ page: 0, size: 25 });
  });

  it("loads the next page on demand", async () => {
    const user = userEvent.setup();
    vi.mocked(getTransactions).mockImplementation(async ({ page: number }) => page(number));
    renderReports();
    await screen.findByText("Lunch");
    await user.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => expect(getTransactions).toHaveBeenLastCalledWith({ page: 1, size: 25 }));
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  });

  it("posts required data, selected ids and an optional additional description", async () => {
    const user = userEvent.setup();
    renderReports();
    await screen.findByText("Lunch");
    await user.click(screen.getByRole("button", { name: "Add transaction" }));

    const dialog = screen.getByRole("dialog", { name: "Add transaction" });
    await user.type(within(dialog).getByRole("textbox", { name: "Description" }), "Coffee");
    await user.clear(within(dialog).getByRole("textbox", { name: "Amount (₹)" }));
    await user.type(within(dialog).getByRole("textbox", { name: "Amount (₹)" }), "80.25");
    await chooseOption(user, dialog, "Source", "HDFC Bank");
    await chooseOption(user, dialog, "Payment method", "UPI");
    await chooseOption(user, dialog, "Category", "Food");
    await user.type(within(dialog).getByRole("textbox", { name: "Additional information (optional)" }), "Takeaway");
    const dateField = within(dialog).getByRole("button", { name: /Transaction date and time/ });
    const expectedDate = new Date(dateField.getAttribute("data-value")!).toISOString();
    await user.click(within(dialog).getByRole("button", { name: "Save transaction" }));

    await waitFor(() => expect(createTransaction).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createTransaction).mock.calls[0]?.[0]).toEqual({
      description: "Coffee",
      amount: 80.25,
      sourceId: "s-1",
      paymentId: "m-1",
      categoryId: "category-expense",
      currency: "INR",
      createdAt: expectedDate,
      additionalInfo: "Takeaway",
    });

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows the selected source balance and prevents expenses from exceeding it", async () => {
    const user = userEvent.setup();
    renderReports();
    await screen.findByText("Lunch");
    await user.click(screen.getByRole("button", { name: "Add transaction" }));

    const dialog = screen.getByRole("dialog", { name: "Add transaction" });
    await user.type(within(dialog).getByRole("textbox", { name: "Description" }), "Large purchase");
    await user.type(within(dialog).getByRole("textbox", { name: "Amount (₹)" }), "248820.01");
    await chooseOption(user, dialog, "Source", "HDFC Bank");
    expect(within(dialog).getByRole("status")).toHaveTextContent("Current source balance: ₹248,820.00");
    await chooseOption(user, dialog, "Payment method", "UPI");
    await chooseOption(user, dialog, "Category", "Food");

    expect(within(dialog).getByRole("alert")).toHaveTextContent("Expense amount cannot exceed the selected source balance.");
    await user.click(within(dialog).getByRole("button", { name: "Save transaction" }));
    expect(createTransaction).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("radio", { name: "Income" }));
    await chooseOption(user, dialog, "Category", "Salary");
    await user.click(within(dialog).getByRole("button", { name: "Save transaction" }));
    await waitFor(() => expect(createTransaction).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createTransaction).mock.calls[0]?.[0].amount).toBe(248820.01);
  });

  it("edits a transaction and submits the updated fields", async () => {
    const user = userEvent.setup();
    const updatedSources = testSources.map((source) =>
      source.id === "s-1" ? { ...source, balance: 248569.5 } : source,
    );
    vi.mocked(getSources).mockResolvedValueOnce(updatedSources);
    renderReports();
    await screen.findByText("Lunch");
    await user.click(screen.getByRole("button", { name: "Edit Lunch" }));

    const dialog = screen.getByRole("dialog", { name: "Edit transaction" });
    const description = within(dialog).getByRole("textbox", { name: "Description" });
    await user.clear(description);
    await user.type(description, "Updated lunch");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    await waitFor(() => expect(updateTransaction).toHaveBeenCalledTimes(1));
    expect(vi.mocked(updateTransaction).mock.calls[0]).toEqual([
      "txn-1",
      expect.objectContaining({
        description: "Updated lunch",
        amount: 250.5,
        sourceId: "s-1",
        paymentId: "m-1",
        categoryId: "category-expense",
      }),
    ]);
    await waitFor(() => expect(getSources).toHaveBeenCalledTimes(1));

    await user.click(screen.getByRole("button", { name: "Edit Lunch" }));
    expect(within(screen.getByRole("dialog", { name: "Edit transaction" })).getByRole("status"))
      .toHaveTextContent("Current source balance: ₹248,569.50");
  });

  it("formats whole amounts with two decimals while keeping cents editable", async () => {
    const user = userEvent.setup();
    renderReports();
    await screen.findByText("Lunch");
    await user.click(screen.getByRole("button", { name: "Add transaction" }));

    const dialog = screen.getByRole("dialog", { name: "Add transaction" });
    const amount = within(dialog).getByRole("textbox", { name: "Amount (₹)" });
    expect(amount).toHaveAttribute("type", "text");
    expect(amount).toHaveAttribute("inputmode", "decimal");
    expect(amount).toHaveAttribute("placeholder", "0.00");

    await user.type(amount, "80");
    await user.tab();
    expect(amount).toHaveValue("80.00");

    await user.clear(amount);
    await user.type(amount, "80.03");
    expect(amount).toHaveValue("80.03");
    await user.tab();
    expect(amount).toHaveValue("80.03");
  });

  it("confirms before deleting a transaction", async () => {
    const user = userEvent.setup();
    renderReports();
    await screen.findByText("Lunch");
    await user.click(screen.getByRole("button", { name: "Delete Lunch" }));

    const dialog = screen.getByRole("dialog", { name: "Delete transaction?" });
    expect(within(dialog).getByText("Lunch")).toBeInTheDocument();
    expect(deleteTransaction).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Delete transaction" }));
    await waitFor(() => expect(vi.mocked(deleteTransaction).mock.calls[0]?.[0]).toBe("txn-1"));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("uses the styled date and time picker to select a transaction date and time", async () => {
    const user = userEvent.setup();
    renderReports();
    await screen.findByText("Lunch");
    await user.click(screen.getByRole("button", { name: "Add transaction" }));

    const dialog = screen.getByRole("dialog", { name: "Add transaction" });
    const trigger = within(dialog).getByRole("button", { name: /Transaction date and time/ });
    const originalDate = trigger.getAttribute("data-value")!;
    const [year, month] = originalDate.split("T")[0].split("-").map(Number);
    const selectedDate = new Date(year, month - 1, 15);
    const dateLabel = new Intl.DateTimeFormat(undefined, { dateStyle: "full" }).format(selectedDate);
    await user.click(trigger);
    const picker = within(dialog).getByRole("dialog", { name: "Transaction date and time" });
    const dateButton = within(picker).getByRole("button", { name: dateLabel });
    await user.click(dateButton);
    await user.clear(within(picker).getByRole("textbox", { name: "Hour" }));
    await user.type(within(picker).getByRole("textbox", { name: "Hour" }), "09");
    await user.clear(within(picker).getByRole("textbox", { name: "Minute" }));
    await user.type(within(picker).getByRole("textbox", { name: "Minute" }), "30");
    await user.click(within(picker).getByRole("button", { name: "AM" }));

    const dateField = within(dialog).getByRole("button", { name: /Transaction date and time/ });
    expect(dateField).toHaveAttribute("data-value", `${originalDate.split("T")[0].slice(0, 8)}15T09:30`);
    expect(within(picker).getByRole("button", { name: "AM" })).toHaveAttribute("aria-pressed", "true");

    await user.click(within(picker).getByRole("button", { name: "PM" }));
    expect(dateField).toHaveAttribute("data-value", `${originalDate.split("T")[0].slice(0, 8)}15T21:30`);
    expect(within(picker).getByRole("button", { name: "PM" })).toHaveAttribute("aria-pressed", "true");

    const hourInput = within(picker).getByRole("textbox", { name: "Hour" });
    await user.clear(hourInput);
    await user.type(hourInput, "12");
    expect(dateField).toHaveAttribute("data-value", `${originalDate.split("T")[0].slice(0, 8)}15T12:30`);
    await user.click(within(picker).getByRole("button", { name: "AM" }));
    expect(dateField).toHaveAttribute("data-value", `${originalDate.split("T")[0].slice(0, 8)}15T00:30`);
  });

  it("limits category choices to the selected income or expense type", async () => {
    const user = userEvent.setup();
    renderReports();
    await screen.findByText("Lunch");
    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    const dialog = screen.getByRole("dialog", { name: "Add transaction" });

    await user.click(within(dialog).getByRole("combobox", { name: "Category" }));
    expect(screen.getByRole("option", { name: "Food" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Salary" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("option", { name: "Food" }));
    await user.click(within(dialog).getByRole("radio", { name: "Income" }));
    await user.click(within(dialog).getByRole("combobox", { name: "Category" }));
    expect(screen.getByRole("option", { name: "Salary" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Food" })).not.toBeInTheDocument();
  });

  it("requires the transaction fields but allows additional information to be omitted", async () => {
    const user = userEvent.setup();
    renderReports();
    await screen.findByText("Lunch");
    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    const dialog = screen.getByRole("dialog", { name: "Add transaction" });

    await user.click(within(dialog).getByRole("button", { name: "Save transaction" }));
    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Complete all required fields");
    expect(createTransaction).not.toHaveBeenCalled();

    await user.type(within(dialog).getByRole("textbox", { name: "Description" }), "Coffee");
    await user.type(within(dialog).getByRole("textbox", { name: "Amount (₹)" }), "80");
    await chooseOption(user, dialog, "Source", "HDFC Bank");
    await chooseOption(user, dialog, "Payment method", "UPI");
    await chooseOption(user, dialog, "Category", "Food");
    await user.click(within(dialog).getByRole("button", { name: "Save transaction" }));

    await waitFor(() => expect(createTransaction).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createTransaction).mock.calls[0]?.[0]).not.toHaveProperty("additionalInfo");
  });

  it("shows the API error if loading transactions fails", async () => {
    vi.mocked(getTransactions).mockRejectedValueOnce(new Error("offline"));
    renderReports();
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load transactions");
  });
});

async function chooseOption(
  user: ReturnType<typeof userEvent.setup>,
  dialog: HTMLElement,
  fieldName: string,
  optionName: string,
) {
  await user.click(within(dialog).getByRole("combobox", { name: fieldName }));
  await user.click(screen.getByRole("option", { name: optionName }));
}
