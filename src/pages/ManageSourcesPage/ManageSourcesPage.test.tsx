import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ManageSourcesPage from "./ManageSourcesPage";
import { renderWithProviders } from "@/test/renderWithProviders";

describe("ManageSourcesPage", () => {
  it("lists the available sources", () => {
    renderWithProviders(<ManageSourcesPage />);
    const list = screen.getByRole("list", { name: "Financial sources" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    expect(within(list).getByText("HDFC Bank")).toBeInTheDocument();
    expect(within(list).getByText("Savings account · ••4582")).toBeInTheDocument();
    expect(within(list).getByText("₹2,48,820")).toBeInTheDocument();
    expect(within(list).getByText("Credit card · ••8291 · Limit ₹5,00,000")).toBeInTheDocument();
    expect(within(list).getByText("₹34,680")).toBeInTheDocument();
    expect(within(list).getByText("₹12,450")).toBeInTheDocument();
    expect(within(list).getByText("SBI · EMI ₹32,400 · 8.5% p.a.")).toBeInTheDocument();
  });

  it("shows cash first", () => {
    renderWithProviders(<ManageSourcesPage />);
    const items = within(screen.getByRole("list", { name: "Financial sources" })).getAllByRole("listitem");
    expect(within(items[0]).getByText("Cash")).toBeInTheDocument();
  });

  it("opens the add modal and shows the new source in the list", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageSourcesPage />);
    await user.click(screen.getByRole("button", { name: "Add source" }));
    const dialog = screen.getByRole("dialog", { name: "Add source" });

    await user.click(within(dialog).getByRole("radio", { name: "Credit card" }));
    await user.type(within(dialog).getByRole("textbox", { name: "Card name" }), "Amazon Pay");
    await user.type(within(dialog).getByRole("textbox", { name: "Credit limit (₹)" }), "100000");
    await user.type(within(dialog).getByRole("textbox", { name: "Card number (last 4 digits)" }), "4321");
    await user.type(within(dialog).getByRole("textbox", { name: "Current balance (₹)" }), "0");
    await user.click(within(dialog).getByRole("button", { name: "Add source" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Financial sources" });
    expect(within(list).getByText("Amazon Pay")).toBeInTheDocument();
    expect(within(list).getAllByRole("listitem")).toHaveLength(5);
  });

  it("edits a source", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageSourcesPage />);
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Edit Cash" }));
    const balance = screen.getByRole("textbox", { name: "Current balance (₹)" });
    await user.clear(balance);
    await user.type(balance, "100");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByText("₹100")).toBeInTheDocument();
  });

  it("deletes a source after confirmation", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageSourcesPage />);
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Delete Home Loan" }));
    expect(screen.getByRole("dialog", { name: "Delete Home Loan?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.queryByText("Home Loan")).not.toBeInTheDocument();
  });

  it("keeps the source when deletion is cancelled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageSourcesPage />);
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Delete Home Loan" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("Home Loan")).toBeInTheDocument();
  });

  it("hides edit and delete until Edit is pressed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageSourcesPage />);
    expect(screen.queryByRole("button", { name: /^(Edit|Delete) .+/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getAllByRole("button", { name: /^Edit .+/ })).toHaveLength(4);
    expect(screen.getAllByRole("button", { name: /^Delete .+/ })).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("button", { name: /^(Edit|Delete) .+/ })).not.toBeInTheDocument();
  });

  it("cannot delete cash", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ManageSourcesPage />);
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.queryByRole("button", { name: "Delete Cash" })).not.toBeInTheDocument();
  });
});
