import { useEffect, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth/useAuth";
import {
  PaymentMethodsContext,
  type PaymentMethodsContextValue,
} from "@/hooks/usePaymentMethods/usePaymentMethods";
import {
  createPaymentMethod,
  getPaymentMethods,
  updatePaymentMethod,
  deletePaymentMethod,
} from "@/services/paymentMethodsService/paymentMethodsService";
import { queryKeys } from "@/data/queryClient";
import { getAccessToken } from "@/services/tokenStore/tokenStore";
import type { PaymentMethod, PaymentMethodInput } from "@/types/transactionOptions";

export default function PaymentMethodsProvider({
  children,
  initialMethods,
  shouldLoad = true,
}: {
  children: ReactNode;
  initialMethods?: PaymentMethod[];
  shouldLoad?: boolean;
}) {
  const { user, isInitializing } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = queryKeys.paymentMethods(user?.id ?? "anonymous");
  const methodsQuery = useQuery({
    queryKey,
    queryFn: getPaymentMethods,
    enabled: shouldLoad && !isInitializing && user !== null && Boolean(getAccessToken()),
    staleTime: Infinity,
    initialData: initialMethods,
    meta: { requiresAuth: true },
  });

  const createMutation = useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: (created) => {
      queryClient.setQueryData<PaymentMethod[]>(queryKey, (current) => [...(current ?? []), created]);
      return queryClient.invalidateQueries({ queryKey });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PaymentMethodInput }) => updatePaymentMethod(id, input),
    onSuccess: (updated) => {
      queryClient.setQueryData<PaymentMethod[]>(queryKey, (current) =>
        current?.map((method) => (method.id === updated.id ? updated : method)),
      );
      return queryClient.invalidateQueries({ queryKey });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<PaymentMethod[]>(queryKey, (current) => current?.filter((method) => method.id !== id));
      return queryClient.invalidateQueries({ queryKey });
    },
  });
  const mutationFailed = createMutation.isError || updateMutation.isError || deleteMutation.isError;
  const error = methodsQuery.isError ? "load" : mutationFailed ? "mutation" : null;

  useEffect(() => {
    if (methodsQuery.error) {
      console.error(
        "Could not load payment methods.",
        methodsQuery.error instanceof Error ? methodsQuery.error.message : "Unexpected error",
      );
    }
  }, [methodsQuery.error]);

  const resetMutationErrors = () => {
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
  };

  const reloadMethods = async () => {
    await methodsQuery.refetch();
  };

  const addMethod = async (input: PaymentMethodInput) => {
    resetMutationErrors();
    try {
      await createMutation.mutateAsync(input);
    } catch (cause) {
      console.error("Could not create payment method.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  };

  const updateMethod = async (id: string, input: PaymentMethodInput) => {
    resetMutationErrors();
    try {
      await updateMutation.mutateAsync({ id, input });
    } catch (cause) {
      console.error("Could not update payment method.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  };

  const removeMethod = async (id: string) => {
    resetMutationErrors();
    try {
      await deleteMutation.mutateAsync(id);
    } catch (cause) {
      console.error("Could not delete payment method.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  };

  const value: PaymentMethodsContextValue = {
    methods: methodsQuery.data ?? initialMethods ?? [],
    loading: (user !== null && (isInitializing || methodsQuery.isFetching)) && initialMethods === undefined,
    error,
    reloadMethods,
    addMethod,
    updateMethod,
    removeMethod,
  };

  return <PaymentMethodsContext.Provider value={value}>{children}</PaymentMethodsContext.Provider>;
}
