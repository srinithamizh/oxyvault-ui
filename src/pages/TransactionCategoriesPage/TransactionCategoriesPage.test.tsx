import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransactionCategoriesPage from "./TransactionCategoriesPage";
import { renderWithProviders } from "@/test/renderWithProviders";

const list = () => screen.getByRole("list", { name: "Categories" });

describe("TransactionCategoriesPage", () => {
  it("lists the default categories and nothing else", () => {
    renderWithProviders(<TransactionCategoriesPage />);
    expect(within(list()).getByText("Salary")).toBeInTheDocument();
    expect(within(list()).getByText("Food & dining")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Payment methods" })).not.toBeInTheDocument();
  });

  it("marks each category as income or expense", () => {
    renderWithProviders(<TransactionCategoriesPage />);
    const items = within(list()).getAllByRole("listitem");
    expect(within(items[0]).getByText("Income")).toBeInTheDocument();
    expect(within(items[3]).getByText("Expense")).toBeInTheDocument();
  });

  it("hides edit and delete until Edit is pressed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TransactionCategoriesPage />);
    expect(screen.queryByRole("button", { name: /^Delete / })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit categories" }));
    expect(screen.getAllByRole("button", { name: /^Delete / })).toHaveLength(10);
    await user.click(screen.getByRole("button", { name: "Done editing categories" }));
    expect(screen.queryByRole("button", { name: /^Delete / })).not.toBeInTheDocument();
  });

  it("adds an income category", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TransactionCategoriesPage />);
    await user.click(screen.getByRole("button", { name: "Add category" }));
    await user.type(screen.getByRole("textbox", { name: "Category name" }), "Dividends");
    await user.click(screen.getByRole("radio", { name: "Income" }));
    await user.click(screen.getByRole("button", { name: "Add" }));
    const items = within(list()).getAllByRole("listitem");
    const added = items[items.length - 1];
    expect(within(added).getByText("Dividends")).toBeInTheDocument();
    expect(within(added).getByText("Income")).toBeInTheDocument();
  });

  it("changes a category's type when editing", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TransactionCategoriesPage />);
    await user.click(screen.getByRole("button", { name: "Edit categories" }));
    await user.click(screen.getByRole("button", { name: "Edit Rent" }));
    await user.click(screen.getByRole("radio", { name: "Income" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    const items = within(list()).getAllByRole("listitem");
    expect(within(items[7]).getByText("Rent")).toBeInTheDocument();
    expect(within(items[7]).getByText("Income")).toBeInTheDocument();
  });

  it("deletes a category after confirmation and keeps it when cancelled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TransactionCategoriesPage />);
    await user.click(screen.getByRole("button", { name: "Edit categories" }));
    await user.click(screen.getByRole("button", { name: "Delete Rent" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(within(list()).getByText("Rent")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete Rent" }));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(within(list()).queryByText("Rent")).not.toBeInTheDocument();
  });
});
