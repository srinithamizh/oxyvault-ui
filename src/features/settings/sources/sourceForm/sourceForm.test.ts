import i18n from "@/i18n/i18n";
import { testSources } from "@/test/fixtures/sources";
import { draftFromSource, emptyDraft, validateDraft } from "./sourceForm";

const t = i18n.t.bind(i18n);

describe("validateDraft", () => {
  it("builds a bank source from valid input", () => {
    const draft = { ...emptyDraft("bank"), name: " ICICI ", lastFour: "6789", balance: "1,500.50", accountType: "current" as const };
    expect(validateDraft("bank", draft, t).input).toEqual({
      type: "bank",
      name: "ICICI",
      accountType: "current",
      lastFour: "6789",
      balance: 1500.5,
    });
  });

  it("requires a bank name and balance but allows optional account details", () => {
    const { errors, input } = validateDraft("bank", { ...emptyDraft("bank"), lastFour: "12ab" }, t);
    expect(input).toBeUndefined();
    expect(errors).toEqual({ name: "Enter the bank name.", lastFour: "Enter exactly 4 digits.", balance: "Enter a valid amount." });
    expect(validateDraft("bank", { ...emptyDraft("bank"), name: "Bank", balance: "0", lastFour: "" }, t).input).toEqual({
      type: "bank",
      name: "Bank",
      balance: 0,
      accountType: "savings",
    });
  });

  it("builds a credit card from a name and limit", () => {
    const draft = { ...emptyDraft("card"), name: "Amex", lastFour: "1111", creditLimit: "200000", balance: "5000" };
    expect(validateDraft("card", draft, t).input).toEqual({ type: "card", name: "Amex", lastFour: "1111", creditLimit: 200000, balance: 5000 });
    expect(validateDraft("card", emptyDraft("card"), t).errors).toEqual({
      name: "Enter the card name.",
      balance: "Enter a valid amount.",
    });
  });

  it("only needs a balance for cash and always keeps the name Cash", () => {
    expect(validateDraft("cash", { ...emptyDraft("cash"), balance: "900" }, t).input).toEqual({
      type: "cash",
      name: "Cash",
      balance: 900,
    });
    expect(validateDraft("cash", { ...emptyDraft("cash"), balance: "-1" }, t).errors.balance).toBe("Enter an amount greater than zero.");
  });

  it("validates required loan fields and optional numeric rates", () => {
    const { errors } = validateDraft("loan", { ...emptyDraft("loan"), emi: "0", interestRate: "-1" }, t);
    expect(Object.keys(errors).sort()).toEqual(["balance", "interestRate", "name"]);

    const draft = { ...emptyDraft("loan"), name: "Car", provider: "SBI", emi: "9000", interestRate: "9.5", balance: "400000" };
    expect(validateDraft("loan", draft, t).input).toEqual({
      type: "loan",
      name: "Car",
      provider: "SBI",
      emi: 9000,
      interestRate: 9.5,
      balance: 400000,
    });
    expect(validateDraft("loan", { ...emptyDraft("loan"), name: "Loan", balance: "1000" }, t).input).toEqual({
      type: "loan",
      name: "Loan",
      balance: 1000,
    });
    expect(validateDraft("loan", { ...emptyDraft("loan"), name: "Loan", balance: "1000", interestRate: "120" }, t).input)
      .toMatchObject({ interestRate: 120 });
  });
});

describe("draftFromSource", () => {
  it.each(testSources)("round-trips the seeded $type source", (source) => {
    const { id, ...input } = source;
    expect(id).toBe(source.id);
    expect(validateDraft(source.type, draftFromSource(source), t).input).toEqual(input);
  });
});
