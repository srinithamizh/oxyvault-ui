import { useEffect, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth/useAuth";
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
import { queryKeys } from "@/data/queryClient";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import type { TransactionCategory, TransactionCategoryInput } from "@/types/transactionOptions";

interface TransactionCategoriesProviderProps {
  children: ReactNode;
  initialCategories?: TransactionCategory[];
  shouldLoad?: boolean;
}

export default function TransactionCategoriesProvider({
  children,
  initialCategories,
  shouldLoad = true,
}: TransactionCategoriesProviderProps) {
  const { user, isInitializing } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.transactionCategories(user?.id ?? "anonymous");
  const categoriesQuery = useQuery({
    queryKey,
    queryFn: getCategories,
    enabled: shouldLoad && !isInitializing && user !== null && Boolean(getAccessToken()),
    staleTime: Infinity,
    initialData: initialCategories,
    meta: { requiresAuth: true },
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (created) => {
      queryClient.setQueryData<TransactionCategory[]>(queryKey, (current) => [...(current ?? []), created]);
      return queryClient.invalidateQueries({ queryKey });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionCategoryInput }) => updateCategoryRequest(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData<TransactionCategory[]>(queryKey, (current) =>
        current?.map((category) => (category.id === updated.id ? updated : category)),
      );
      return queryClient.invalidateQueries({ queryKey });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<TransactionCategory[]>(queryKey, (current) => current?.filter((category) => category.id !== id));
      return queryClient.invalidateQueries({ queryKey });
    },
  });
  const mutationFailed = createMutation.isError || updateMutation.isError || deleteMutation.isError;
  const error = categoriesQuery.isError ? "load" : mutationFailed ? "mutation" : null;

  useEffect(() => {
    if (categoriesQuery.error) {
      console.error(
        "Could not load transaction categories.",
        categoriesQuery.error instanceof Error ? categoriesQuery.error.message : "Unexpected error",
      );
    }
  }, [categoriesQuery.error]);

  const resetMutationErrors = () => {
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
  };

  const reloadCategories = async () => {
    await categoriesQuery.refetch();
  };

  const addCategory = async (input: TransactionCategoryInput) => {
    resetMutationErrors();
    try {
      await createMutation.mutateAsync(input);
    } catch (cause) {
      console.error("Could not create transaction category.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  };

  const updateCategory = async (id: string, input: TransactionCategoryInput) => {
    resetMutationErrors();
    try {
      await updateMutation.mutateAsync({ id, input });
    } catch (cause) {
      console.error("Could not update transaction category.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  };

  const removeCategory = async (id: string) => {
    resetMutationErrors();
    try {
      await deleteMutation.mutateAsync(id);
    } catch (cause) {
      console.error("Could not delete transaction category.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  };

  const value: TransactionCategoriesContextValue = {
    categories: categoriesQuery.data ?? initialCategories ?? [],
    loading: (user !== null && (isInitializing || categoriesQuery.isFetching)) && initialCategories === undefined,
    error,
    reloadCategories,
    addCategory,
    updateCategory,
    removeCategory,
  };

  return <TransactionCategoriesContext.Provider value={value}>{children}</TransactionCategoriesContext.Provider>;
}
