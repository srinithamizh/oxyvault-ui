import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  clearPaymentMethodsCache,
} from "@/services/paymentMethodsService/paymentMethodsService";
import type { PaymentMethod, PaymentMethodInput } from "@/types/transactionOptions";

export default function PaymentMethodsProvider({
  children,
  initialMethods,
}: {
  children: ReactNode;
  initialMethods?: PaymentMethod[];
}) {
  const { user, isInitializing } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods ?? []);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(
    initialMethods === undefined ? null : user?.id ?? null,
  );
  const [loading, setLoading] = useState(initialMethods === undefined && (isInitializing || user !== null));
  const [errorState, setErrorState] = useState<{ userId: string | null; type: "load" | "mutation" } | null>(null);
  const methodsVersion = useRef(0);
  const error = errorState?.userId === (user?.id ?? null) ? errorState.type : null;
  const isLoading =
    initialMethods === undefined &&
    ((isInitializing && loading) ||
      (user !== null && (loading || (loadedUserId !== user.id && errorState?.userId !== user.id))));

  const reloadMethods = useCallback(async () => {
    if (!user) return;
    const requestVersion = ++methodsVersion.current;
    setLoading(true);
    setErrorState(null);
    try {
      const result = await getPaymentMethods();
      if (requestVersion === methodsVersion.current) {
        setMethods(result);
        setLoadedUserId(user.id);
        setErrorState(null);
      }
    } catch (cause) {
      if (requestVersion === methodsVersion.current) {
        setErrorState({ userId: user.id, type: "load" });
        console.error("Could not load payment methods.", cause instanceof Error ? cause.message : "Unexpected error");
      }
    } finally {
      if (requestVersion === methodsVersion.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (initialMethods !== undefined || isInitializing) return;
    if (!user) {
      methodsVersion.current += 1;
      clearPaymentMethodsCache();
      return;
    }

    let active = true;
    const requestVersion = ++methodsVersion.current;
    getPaymentMethods()
      .then((result) => {
        if (active && requestVersion === methodsVersion.current) {
          setMethods(result);
          setLoadedUserId(user.id);
          setErrorState(null);
        }
      })
      .catch((cause: unknown) => {
        if (!active || requestVersion !== methodsVersion.current) return;
        setErrorState({ userId: user.id, type: "load" });
        console.error("Could not load payment methods.", cause instanceof Error ? cause.message : "Unexpected error");
      })
      .finally(() => {
        if (active && requestVersion === methodsVersion.current) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [initialMethods, isInitializing, user]);

  const addMethod = useCallback(async (input: PaymentMethodInput) => {
    setErrorState(null);
    try {
      const created = await createPaymentMethod(input);
      methodsVersion.current += 1;
      setMethods((current) => [...current, created]);
      setLoadedUserId(user?.id ?? null);
      setLoading(false);
    } catch (cause) {
      setErrorState({ userId: user?.id ?? null, type: "mutation" });
      console.error("Could not create payment method.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  }, [user]);

  const updateMethod = useCallback(async (id: string, input: PaymentMethodInput) => {
    setErrorState(null);
    try {
      const updated = await updatePaymentMethod(id, input);
      methodsVersion.current += 1;
      setMethods((current) => current.map((item) => (item.id === id ? updated : item)));
      setLoadedUserId(user?.id ?? null);
      setLoading(false);
    } catch (cause) {
      setErrorState({ userId: user?.id ?? null, type: "mutation" });
      console.error("Could not update payment method.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  }, [user]);

  const removeMethod = useCallback(async (id: string) => {
    setErrorState(null);
    try {
      await deletePaymentMethod(id);
      methodsVersion.current += 1;
      setMethods((current) => current.filter((item) => item.id !== id));
      setLoadedUserId(user?.id ?? null);
      setLoading(false);
    } catch (cause) {
      setErrorState({ userId: user?.id ?? null, type: "mutation" });
      console.error("Could not delete payment method.", cause instanceof Error ? cause.message : "Unexpected error");
    }
  }, [user]);

  const value = useMemo<PaymentMethodsContextValue>(
    () => ({
      methods: initialMethods !== undefined || (user !== null && loadedUserId === user.id) ? methods : [],
      loading: isLoading,
      error,
      reloadMethods,
      addMethod,
      updateMethod,
      removeMethod,
    }),
    [methods, initialMethods, user, loadedUserId, isLoading, error, reloadMethods, addMethod, updateMethod, removeMethod],
  );

  return <PaymentMethodsContext.Provider value={value}>{children}</PaymentMethodsContext.Provider>;
}
