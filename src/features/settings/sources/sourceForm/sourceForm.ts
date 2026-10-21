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
      return {
        ...draft,
        accountType: source.accountType ?? "savings",
        lastFour: source.lastFour ?? "",
        balance: String(source.balance),
      };
    case "card":
      return {
        ...draft,
        lastFour: source.lastFour ?? "",
        creditLimit: source.creditLimit === undefined ? "" : String(source.creditLimit),
        balance: String(source.balance),
      };
    case "cash":
      return { ...draft, balance: String(source.balance) };
    case "loan":
      return {
        ...draft,
        provider: source.provider ?? "",
        emi: source.emi === undefined ? "" : String(source.emi),
        interestRate: source.interestRate === undefined ? "" : String(source.interestRate),
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
  const amount = (field: "balance" | "emi" | "creditLimit", { optional = false } = {}) => {
    if (optional && !draft[field].trim()) return;
    const value = parseAmount(draft[field]);
    if (Number.isNaN(value)) errors[field] = t("sources.errors.amountInvalid");
    else if (value < 0) errors[field] = t("sources.errors.amountPositive");
  };

  if (type === "bank" || type === "card" || type === "loan") {
    required("name", t(`sources.errors.${type}NameRequired`));
  }
  const checkLastFour = () => {
    if (draft.lastFour.trim() && !LAST_FOUR.test(draft.lastFour.trim())) errors.lastFour = t("sources.errors.lastFourInvalid");
  };

  if (type === "bank") {
    checkLastFour();
    amount("balance");
  }
  if (type === "card") {
    checkLastFour();
    amount("creditLimit", { optional: true });
    amount("balance");
  }
  if (type === "cash") amount("balance");
  if (type === "loan") {
    amount("emi", { optional: true });
    if (draft.interestRate.trim()) {
      const rate = parseAmount(draft.interestRate);
      if (Number.isNaN(rate) || rate < 0) errors.interestRate = t("sources.errors.interestRateInvalid");
    }
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
          balance: parseAmount(draft.balance),
          ...(draft.accountType ? { accountType: draft.accountType } : {}),
          ...(draft.lastFour.trim() ? { lastFour: draft.lastFour.trim() } : {}),
        },
      };
    case "card":
      return {
        errors,
        input: {
          type,
          name,
          balance: parseAmount(draft.balance),
          ...(draft.lastFour.trim() ? { lastFour: draft.lastFour.trim() } : {}),
          ...(draft.creditLimit.trim() ? { creditLimit: parseAmount(draft.creditLimit) } : {}),
        },
      };
    case "cash":
      return { errors, input: { type, name: CASH_NAME, balance: parseAmount(draft.balance) } };
    case "loan":
      return {
        errors,
        input: {
          type,
          name,
          balance: parseAmount(draft.balance),
          ...(draft.provider.trim() ? { provider: draft.provider.trim() } : {}),
          ...(draft.emi.trim() ? { emi: parseAmount(draft.emi) } : {}),
          ...(draft.interestRate.trim() ? { interestRate: parseAmount(draft.interestRate) } : {}),
        },
      };
  }
}
