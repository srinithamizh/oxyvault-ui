import { createContext, useContext } from "react";
import type { TransactionCategory, TransactionCategoryInput } from "@/types/transactionOptions";

export interface TransactionCategoriesContextValue {
  categories: TransactionCategory[];
  loading: boolean;
  error: "load" | "mutation" | null;
  reloadCategories: () => Promise<void>;
  addCategory: (input: TransactionCategoryInput) => Promise<void>;
  updateCategory: (id: string, input: TransactionCategoryInput) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
}

export const TransactionCategoriesContext = createContext<TransactionCategoriesContextValue | null>(null);

export function useTransactionCategories(): TransactionCategoriesContextValue {
  const context = useContext(TransactionCategoriesContext);
  if (!context) {
    throw new Error("useTransactionCategories must be used inside <TransactionCategoriesProvider>");
  }
  return context;
}
