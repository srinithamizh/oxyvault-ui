export type CategoryType = "income" | "expense";

/** How money moved, e.g. UPI, cash or a bank transfer. */
export interface PaymentMethod {
  id: string;
  name: string;
}

/** What a transaction was for. The type decides whether it counts as income or expense in reports. */
export interface TransactionCategory {
  id: string;
  name: string;
  type: CategoryType;
}

export type PaymentMethodInput = Omit<PaymentMethod, "id">;
export type TransactionCategoryInput = Omit<TransactionCategory, "id">;
