import type { TFunction } from "i18next";
import type { FieldErrors } from "@/types/forms";
import type { BankAccountType, Source, SourceInput, SourceType } from "@/types/source";

/** Everything the add/edit form can hold, kept as text so partially typed values are fine. */
export interface SourceDraft {
  name: string;
  accountType: BankAccountType;
  lastFour: string;
  balance: string;
  creditLimit: string;
  provider: string;
  emi: string;
  interestRate: string;
}

export type DraftField = keyof SourceDraft;

export const CASH_NAME = "Cash";

export function emptyDraft(type: SourceType): SourceDraft {
  return {
    name: type === "cash" ? CASH_NAME : "",
    accountType: "savings",
    lastFour: "",
    balance: "",
    creditLimit: "",
    provider: "",
    emi: "",
    interestRate: "",
  };
}

export function draftFromSource(source: Source): SourceDraft {
  const draft = { ...emptyDraft(source.type), name: source.name };
  switch (source.type) {
    case "bank":
      return { ...draft, accountType: source.accountType, lastFour: source.lastFour, balance: String(source.balance) };
    case "card":
      return { ...draft, lastFour: source.lastFour, creditLimit: String(source.creditLimit), balance: String(source.balance) };
    case "cash":
      return { ...draft, balance: String(source.balance) };
    case "loan":
      return {
        ...draft,
        provider: source.provider,
        emi: String(source.emi),
        interestRate: String(source.interestRate),
        balance: String(source.balance),
      };
  }
}

/** The fields shown for each kind of source, in display order. */
export const FIELDS_BY_TYPE: Record<SourceType, DraftField[]> = {
  bank: ["name", "accountType", "lastFour", "balance"],
  card: ["name", "lastFour", "creditLimit", "balance"],
  cash: ["balance"],
  loan: ["name", "provider", "emi", "interestRate", "balance"],
};

const LAST_FOUR = /^\d{4}$/;

function parseAmount(value: string): number {
  const text = value.replace(/,/g, "").trim();
  return text === "" ? Number.NaN : Number(text);
}

export interface DraftValidation {
  errors: FieldErrors<DraftField>;
  /** Present only when there are no errors. */
  input?: SourceInput;
}

export function validateDraft(type: SourceType, draft: SourceDraft, t: TFunction): DraftValidation {
  const errors: FieldErrors<DraftField> = {};
  const required = (field: DraftField, message: string) => {
    if (!draft[field].trim()) errors[field] = message;
  };
  const amount = (field: "balance" | "emi" | "creditLimit", { positive = false } = {}) => {
    const value = parseAmount(draft[field]);
    if (Number.isNaN(value)) errors[field] = t("sources.errors.amountInvalid");
    else if (value < 0 || (positive && value === 0)) errors[field] = t("sources.errors.amountPositive");
  };

  if (type === "bank" || type === "card" || type === "loan") {
    required("name", t(`sources.errors.${type}NameRequired`));
  }
  const checkLastFour = () => {
    if (!LAST_FOUR.test(draft.lastFour.trim())) errors.lastFour = t("sources.errors.lastFourInvalid");
  };

  if (type === "bank") {
    checkLastFour();
    amount("balance");
  }
  if (type === "card") {
    checkLastFour();
    amount("creditLimit", { positive: true });
    amount("balance");
  }
  if (type === "cash") amount("balance");
  if (type === "loan") {
    required("provider", t("sources.errors.providerRequired"));
    amount("emi", { positive: true });
    const rate = parseAmount(draft.interestRate);
    if (Number.isNaN(rate) || rate < 0 || rate > 100) errors.interestRate = t("sources.errors.interestRateInvalid");
    amount("balance");
  }

  if (Object.keys(errors).length > 0) return { errors };

  const name = draft.name.trim();
  switch (type) {
    case "bank":
      return {
        errors,
        input: {
          type,
          name,
          accountType: draft.accountType,
          lastFour: draft.lastFour.trim(),
          balance: parseAmount(draft.balance),
        },
      };
    case "card":
      return { errors, input: { type, name, lastFour: draft.lastFour.trim(), creditLimit: parseAmount(draft.creditLimit), balance: parseAmount(draft.balance) } };
    case "cash":
      return { errors, input: { type, name: CASH_NAME, balance: parseAmount(draft.balance) } };
    case "loan":
      return {
        errors,
        input: {
          type,
          name,
          provider: draft.provider.trim(),
          emi: parseAmount(draft.emi),
          interestRate: parseAmount(draft.interestRate),
          balance: parseAmount(draft.balance),
        },
      };
  }
}
