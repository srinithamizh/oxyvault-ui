import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaymentMethodsPage from "./PaymentMethodsPage";
import { renderWithProviders } from "@/test/renderWithProviders";
import { createPaymentMethod, deletePaymentMethod, updatePaymentMethod } from "@/services/paymentMethodsService/paymentMethodsService";

vi.mock("@/services/paymentMethodsService/paymentMethodsService", () => ({
  getPaymentMethods: vi.fn(),
  createPaymentMethod: vi.fn(),
  updatePaymentMethod: vi.fn(),
  deletePaymentMethod: vi.fn(),
  clearPaymentMethodsCache: vi.fn(),
}));

const list = () => screen.getByRole("list", { name: "Payment methods" });

describe("PaymentMethodsPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(createPaymentMethod).mockImplementation(async (input) => ({ ...input, id: "m-new" }));
    vi.mocked(updatePaymentMethod).mockImplementation(async (id, input) => ({ ...input, id }));
    vi.mocked(deletePaymentMethod).mockResolvedValue();
  });

  it("lists the default payment methods and nothing else", () => {
    renderWithProviders(<PaymentMethodsPage />);
    expect(within(list()).getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "UPI",
      "Cash",
      "Bank",
      "Loan",
      "Bank transfer",
    ]);
    expect(screen.queryByRole("list", { name: "Categories" })).not.toBeInTheDocument();
  });

  it("hides edit and delete until Edit is pressed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaymentMethodsPage />);
    expect(screen.queryByRole("button", { name: /^Delete / })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit payment methods" }));
    expect(screen.getAllByRole("button", { name: /^Delete / })).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "Done editing payment methods" }));
    expect(screen.queryByRole("button", { name: /^Delete / })).not.toBeInTheDocument();
  });

  it("adds a payment method", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaymentMethodsPage />);
    await user.click(screen.getByRole("button", { name: "Add payment method" }));
    await user.type(screen.getByRole("textbox", { name: "Payment method name" }), "Cheque");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(await within(list()).findByText("Cheque")).toBeInTheDocument();
  });

  it("rejects an empty or duplicate name", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaymentMethodsPage />);
    await user.click(screen.getByRole("button", { name: "Add payment method" }));
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByText("Enter a name.")).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "Payment method name" }), "upi");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByText("This name already exists.")).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renames a payment method", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaymentMethodsPage />);
    await user.click(screen.getByRole("button", { name: "Edit payment methods" }));
    await user.click(screen.getByRole("button", { name: "Edit UPI" }));
    const field = screen.getByRole("textbox", { name: "Payment method name" });
    await user.clear(field);
    await user.type(field, "UPI / QR");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await within(list()).findByText("UPI / QR")).toBeInTheDocument();
    expect(within(list()).queryByText("UPI")).not.toBeInTheDocument();
  });

  it("allows keeping a name unchanged while editing", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaymentMethodsPage />);
    await user.click(screen.getByRole("button", { name: "Edit payment methods" }));
    await user.click(screen.getByRole("button", { name: "Edit UPI" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("deletes a payment method after confirmation and keeps it when cancelled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PaymentMethodsPage />);
    await user.click(screen.getByRole("button", { name: "Edit payment methods" }));
    await user.click(screen.getByRole("button", { name: "Delete Loan" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(within(list()).getByText("Loan")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete Loan" }));
    expect(screen.getByRole("dialog", { name: "Delete Loan?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(within(list()).queryByText("Loan")).not.toBeInTheDocument());
  });
});
