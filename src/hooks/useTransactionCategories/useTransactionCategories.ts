import { createContext, useContext } from "react";
import type { TransactionCategory, TransactionCategoryInput } from "@/types/transactionOptions";

export interface TransactionCategoriesContextValue {
  categories: TransactionCategory[];
  addCategory: (input: TransactionCategoryInput) => void;
  updateCategory: (id: string, input: TransactionCategoryInput) => void;
  removeCategory: (id: string) => void;
}

export const TransactionCategoriesContext = createContext<TransactionCategoriesContextValue | null>(null);

export function useTransactionCategories(): TransactionCategoriesContextValue {
  const context = useContext(TransactionCategoriesContext);
  if (!context) {
    throw new Error("useTransactionCategories must be used inside <TransactionCategoriesProvider>");
  }
  return context;
}
