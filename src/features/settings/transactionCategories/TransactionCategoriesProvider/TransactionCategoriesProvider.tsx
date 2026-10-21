import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  TransactionCategoriesContext,
  type TransactionCategoriesContextValue,
} from "@/hooks/useTransactionCategories/useTransactionCategories";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory as updateCategoryRequest,
} from "@/services/transactionCategoriesService/transactionCategoriesService";
import type { TransactionCategory, TransactionCategoryInput } from "@/types/transactionOptions";

interface TransactionCategoriesProviderProps {
  children: ReactNode;
  /** Allows page tests to supply categories without making a backend request. */
  initialCategories?: TransactionCategory[];
}

export default function TransactionCategoriesProvider({
  children,
  initialCategories,
}: TransactionCategoriesProviderProps) {
  const [categories, setCategories] = useState<TransactionCategory[]>(initialCategories ?? []);
  const [loading, setLoading] = useState(initialCategories === undefined);
  const [error, setError] = useState<"load" | "mutation" | null>(null);
  const categoriesVersion = useRef(0);

  const reloadCategories = useCallback(async () => {
    const requestVersion = ++categoriesVersion.current;
    setLoading(true);
    setError(null);
    try {
      const result = await getCategories();
      if (requestVersion === categoriesVersion.current) setCategories(result);
    } catch (cause) {
      if (requestVersion === categoriesVersion.current) {
        setError("load");
        console.error("Could not load transaction categories.", cause instanceof Error ? cause.message : "Unexpected error");
      }
    } finally {
      if (requestVersion === categoriesVersion.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialCategories !== undefined) return;

    let active = true;
    const requestVersion = categoriesVersion.current;
    getCategories()
      .then((result) => {
        if (active && requestVersion === categoriesVersion.current) setCategories(result);
      })
      .catch((cause: unknown) => {
        if (!active || requestVersion !== categoriesVersion.current) return;
        setError("load");
        console.error("Could not load transaction categories.", cause instanceof Error ? cause.message : "Unexpected error");
      })
      .finally(() => {
        if (active && requestVersion === categoriesVersion.current) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialCategories]);

  const addCategory = useCallback(async (input: TransactionCategoryInput) => {
    setError(null);
    try {
      const created = await createCategory(input);
      categoriesVersion.current += 1;
      setCategories((current) => [...current, created]);
      setLoading(false);
    } catch (cause) {
      setError("mutation");
      console.error("Could not create transaction category.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  }, []);

  const updateCategory = useCallback(async (id: string, input: TransactionCategoryInput) => {
    setError(null);
    try {
      const updated = await updateCategoryRequest(id, input);
      categoriesVersion.current += 1;
      setCategories((current) => current.map((category) => (category.id === id ? updated : category)));
      setLoading(false);
    } catch (cause) {
      setError("mutation");
      console.error("Could not update transaction category.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  }, []);

  const removeCategory = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteCategory(id);
      categoriesVersion.current += 1;
      setCategories((current) => current.filter((category) => category.id !== id));
      setLoading(false);
    } catch (cause) {
      setError("mutation");
      console.error("Could not delete transaction category.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  }, []);

  const value = useMemo<TransactionCategoriesContextValue>(
    () => ({
      categories,
      loading,
      error,
      reloadCategories,
      addCategory,
      updateCategory,
      removeCategory,
    }),
    [categories, loading, error, reloadCategories, addCategory, updateCategory, removeCategory],
  );

  return <TransactionCategoriesContext.Provider value={value}>{children}</TransactionCategoriesContext.Provider>;
}
