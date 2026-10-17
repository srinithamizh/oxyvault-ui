import { useMemo, useState, type ReactNode } from "react";
import { seedCategories } from "@/data/mockTransactionCategories";
import {
  TransactionCategoriesContext,
  type TransactionCategoriesContextValue,
} from "@/hooks/useTransactionCategories/useTransactionCategories";
import type { TransactionCategory } from "@/types/transactionOptions";

let nextId = 1;
const createId = () => `c-new-${nextId++}`;

/**
 * Keeps transaction categories in memory, seeded with dummy data. This is the only data the
 * Transaction Categories page needs, so it will map to a single API call. Replace the bodies below with API calls later.
 */
export default function TransactionCategoriesProvider({
  children,
  initialCategories = seedCategories,
}: {
  children: ReactNode;
  initialCategories?: TransactionCategory[];
}) {
  const [categories, setCategories] = useState(initialCategories);

  const value = useMemo<TransactionCategoriesContextValue>(
    () => ({
      categories,
      addCategory: (input) => setCategories((current) => [...current, { ...input, id: createId() }]),
      updateCategory: (id, input) =>
        setCategories((current) => current.map((item) => (item.id === id ? { ...input, id } : item))),
      removeCategory: (id) => setCategories((current) => current.filter((item) => item.id !== id)),
    }),
    [categories],
  );

  return <TransactionCategoriesContext.Provider value={value}>{children}</TransactionCategoriesContext.Provider>;
}
