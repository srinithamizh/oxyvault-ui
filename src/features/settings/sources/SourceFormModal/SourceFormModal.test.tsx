import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SourceFormModal from "./SourceFormModal";
import { seedSources } from "@/data/mockSources";

describe("SourceFormModal (add)", () => {
  it("offers bank, credit card and loan (not cash) with bank selected", () => {
    render(<SourceFormModal onSave={() => {}} onClose={() => {}} />);
    expect(screen.getAllByRole("radio", { name: /^(Bank|Credit card|Cash|Loan)$/ })).toHaveLength(3);
    expect(screen.queryByRole("radio", { name: "Cash" })).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Bank" })).toBeChecked();
    expect(screen.getByRole("textbox", { name: "Bank name" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Account type" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Account number (last 4 digits)" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Current balance (₹)" })).toBeInTheDocument();
  });

  it("saves a bank account", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SourceFormModal onSave={onSave} onClose={() => {}} />);
    await user.type(screen.getByRole("textbox", { name: "Bank name" }), "Axis");
    await user.click(screen.getByRole("radio", { name: "Current" }));
    await user.type(screen.getByRole("textbox", { name: "Account number (last 4 digits)" }), "3210");
    await user.type(screen.getByRole("textbox", { name: "Current balance (₹)" }), "5000");
    await user.click(screen.getByRole("button", { name: "Add source" }));
    expect(onSave).toHaveBeenCalledWith({
      type: "bank",
      name: "Axis",
      accountType: "current",
      lastFour: "3210",
      balance: 5000,
    });
  });

  it("shows errors and does not save an empty form", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SourceFormModal onSave={onSave} onClose={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Add source" }));
    expect(screen.getByText("Enter the bank name.")).toBeInTheDocument();
    expect(screen.getByText("Enter exactly 4 digits.")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("asks for a name and credit limit for a credit card", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SourceFormModal onSave={onSave} onClose={() => {}} />);
    await user.click(screen.getByRole("radio", { name: "Credit card" }));
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
    await user.type(screen.getByRole("textbox", { name: "Card name" }), "Amex Gold");
    await user.type(screen.getByRole("textbox", { name: "Card number (last 4 digits)" }), "1234");
    await user.type(screen.getByRole("textbox", { name: "Credit limit (₹)" }), "300000");
    await user.type(screen.getByRole("textbox", { name: "Current balance (₹)" }), "12000");
    await user.click(screen.getByRole("button", { name: "Add source" }));
    expect(onSave).toHaveBeenCalledWith({ type: "card", name: "Amex Gold", lastFour: "1234", creditLimit: 300000, balance: 12000 });
  });

  it("asks for all loan details", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SourceFormModal onSave={onSave} onClose={() => {}} />);
    await user.click(screen.getByRole("radio", { name: "Loan" }));
    await user.type(screen.getByRole("textbox", { name: "Loan name" }), "Car loan");
    await user.type(screen.getByRole("textbox", { name: "Provider" }), "HDFC");
    await user.type(screen.getByRole("textbox", { name: "EMI amount (₹)" }), "9000");
    await user.type(screen.getByRole("textbox", { name: "Interest rate (% per year)" }), "9.5");
    await user.type(screen.getByRole("textbox", { name: "Current balance (₹)" }), "400000");
    await user.click(screen.getByRole("button", { name: "Add source" }));
    expect(onSave).toHaveBeenCalledWith({
      type: "loan",
      name: "Car loan",
      provider: "HDFC",
      emi: 9000,
      interestRate: 9.5,
      balance: 400000,
    });
  });

  it("closes with Cancel", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<SourceFormModal onSave={() => {}} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("SourceFormModal (edit)", () => {
  const cash = seedSources.find((source) => source.type === "cash")!;

  it("lets cash change only its balance", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<SourceFormModal source={cash} onSave={onSave} onClose={() => {}} />);
    expect(screen.queryByRole("radio", { name: "Bank" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    const balance = screen.getByRole("textbox", { name: "Current balance (₹)" });
    expect(balance).toHaveValue("12450");
    await user.clear(balance);
    await user.type(balance, "20000");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(onSave).toHaveBeenCalledWith({ type: "cash", name: "Cash", balance: 20000 });
  });

  it("pre-fills a bank account", () => {
    const bank = seedSources[0];
    render(<SourceFormModal source={bank} onSave={() => {}} onClose={() => {}} />);
    expect(screen.getByRole("textbox", { name: "Bank name" })).toHaveValue("HDFC Bank");
    expect(screen.getByRole("radio", { name: "Savings" })).toBeChecked();
  });
});
