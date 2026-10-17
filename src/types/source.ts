export type SourceType = "bank" | "card" | "cash" | "loan";
export type BankAccountType = "savings" | "current";

interface SourceBase {
  id: string;
  name: string;
}

export interface BankSource extends SourceBase {
  type: "bank";
  accountType: BankAccountType;
  /** Only the last four digits are stored, to avoid keeping personal data. */
  lastFour: string;
  balance: number;
}

export interface CardSource extends SourceBase {
  type: "card";
  /** Only the last four digits of the card number. */
  lastFour: string;
  /** Total credit limit. */
  creditLimit: number;
  /** Amount currently owed on the card. */
  balance: number;
}

/** There is a single cash source; only its balance is editable. */
export interface CashSource extends SourceBase {
  type: "cash";
  balance: number;
}

export interface LoanSource extends SourceBase {
  type: "loan";
  provider: string;
  /** Monthly instalment. */
  emi: number;
  /** Annual rate in percent. */
  interestRate: number;
  /** Outstanding principal. */
  balance: number;
}

export type Source = BankSource | CardSource | CashSource | LoanSource;

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

/** A source before the store assigns it an id. */
export type SourceInput = DistributiveOmit<Source, "id">;
